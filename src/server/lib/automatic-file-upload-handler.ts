import type { FileUpload } from "@remix-run/form-data-parser";
import { nanoid } from "nanoid";
import pLimit from "p-limit";

import { OPTIMIZED_FORMAT } from "#/const/image-const";
import { deletePublicFile, uploadPublicFileStream } from "#/infrastructure/s3-client";
import { createThumbnail } from "#/server/lib/create-thumbnail";
import { optimizeImage } from "#/server/lib/optimize-image";
import { nodeStreamFromWeb } from "#/server/lib/utils";
import { validateImageType } from "#/server/lib/validate-image-type";

const uploadQueue = pLimit(2);

export function createFileUploadHandler() {
  const fieldNameSet = new Set<string>();
  const uploadedKeys: string[] = [];

  return (fileUpload: FileUpload) =>
    uploadQueue(async () => {
      fieldNameSet.add(fileUpload.fieldName);

      try {
        const { stream } = await validateImageType(fileUpload.stream());
        const key = `tmp-images/${nanoid()}.${OPTIMIZED_FORMAT}`;

        const [forMain, forThumb] = stream.tee();

        const optimized = optimizeImage(nodeStreamFromWeb(forMain as ReadableStream<Uint8Array>));
        const thumbnail = createThumbnail(
          nodeStreamFromWeb(forThumb as ReadableStream<Uint8Array>),
        );

        const s3Upload = uploadPublicFileStream(key, optimized.stream, {
          contentType: optimized.contentType,
        });

        const thumbKey = `tmp-images/${nanoid()}.${OPTIMIZED_FORMAT}`;

        const thumbUpload = uploadPublicFileStream(thumbKey, thumbnail.stream, {
          contentType: thumbnail.contentType,
        });

        await Promise.all([s3Upload, thumbUpload]);
        uploadedKeys.push(key, thumbKey);

        return JSON.stringify({
          key,
          thumbKey,
          filename: fileUpload.name,
          fileExt: OPTIMIZED_FORMAT,
        });
      } catch (error) {
        await Promise.allSettled(uploadedKeys.map((uploadKey) => deletePublicFile(uploadKey)));
        throw error;
      }
    });
}
