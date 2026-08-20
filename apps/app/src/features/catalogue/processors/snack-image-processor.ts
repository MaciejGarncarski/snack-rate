import pLimit from "p-limit";

import { OPTIMIZED_FORMAT } from "#/const/image-const";
import type { UploadedImage } from "#/features/catalogue/server/services/snack-image.service";
import type { Slug } from "#/features/shared/value-objects/slug.vo";
import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";
import { deletePublicFile, uploadPublicFileStream } from "#/infrastructure/s3-client";
import { createThumbnail } from "#/server/lib/create-thumbnail";
import { optimizeImage } from "#/server/lib/optimize-image";
import { nodeStreamFromWeb } from "#/server/lib/utils";
import { validateImageType } from "#/server/lib/validate-image-type";

const uploadQueue = pLimit(2);

export async function processUploadedImages(files: File[], slug: Slug): Promise<UploadedImage[]> {
  const uploadedKeys: string[] = [];

  try {
    const images = await Promise.all(
      files.map((file, index) =>
        uploadQueue(async () => {
          const { stream } = await validateImageType(file.stream());
          const [forMain, forThumb] = stream.tee();
          const optimized = optimizeImage(nodeStreamFromWeb(forMain as ReadableStream<Uint8Array>));

          const thumbnail = createThumbnail(
            nodeStreamFromWeb(forThumb as ReadableStream<Uint8Array>),
          );

          const key = StorageKey.create(slug, OPTIMIZED_FORMAT).getValue();
          const thumbKey = StorageKey.createThumb(slug, OPTIMIZED_FORMAT).getValue();

          uploadedKeys.push(key, thumbKey);

          await Promise.all([
            uploadPublicFileStream(key, optimized.stream, {
              contentType: optimized.contentType,
            }),
            uploadPublicFileStream(thumbKey, thumbnail.stream, {
              contentType: thumbnail.contentType,
            }),
          ]);

          return { key, thumbKey, index };
        }),
      ),
    );

    return images;
  } catch (error) {
    await Promise.allSettled(uploadedKeys.map((uploadKey) => deletePublicFile(uploadKey)));
    throw error;
  }
}
