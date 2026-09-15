import { ORPCError } from "@orpc/client";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { uuidv7 } from "uuidv7";

import {
  ALLOWED_MIME_TYPES,
  AVATAR_MAX_FILE_SIZE,
  AVATAR_QUALITY,
  AVATAR_SIZE,
} from "#/const/image-const";
import { deletePublicFile, getPublicFileUrl, uploadPublicFile } from "#/infrastructure/s3-client";
import { serverEnv } from "#/lib/server.env";
import { logger } from "#/observability/logger/logger";

function extractOwnAvatarKey(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const prefix = `${serverEnv.S3_ENDPOINT}/`;
  if (!imageUrl.startsWith(prefix)) return null;
  const key = imageUrl.slice(prefix.length);
  if (!key.startsWith("avatars/")) return null;
  return key;
}

export async function uploadAvatar(
  file: File,
  userId: string,
  previousImage: string | null,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length === 0 || buffer.length > AVATAR_MAX_FILE_SIZE) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Avatar jest za duży (maks. 2 MB).",
    });
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nieobsługiwany format pliku. Dozwolone: JPEG, PNG, WebP, AVIF.",
    });
  }

  const key = `avatars/${userId}/${uuidv7()}.webp`;
  const processed = await sharp(buffer, { sequentialRead: true })
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .toFormat("webp", { quality: AVATAR_QUALITY })
    .toBuffer();

  await uploadPublicFile(key, processed);

  const previousKey = extractOwnAvatarKey(previousImage);
  if (previousKey && previousKey !== key) {
    try {
      await deletePublicFile(previousKey);
    } catch (error) {
      logger.warn({ err: error, key: previousKey }, "Failed to delete previous avatar");
    }
  }

  return getPublicFileUrl(key);
}
