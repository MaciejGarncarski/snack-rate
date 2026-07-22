import { fileTypeStream } from "file-type";

import { ALLOWED_MIME_TYPES } from "#/const/image-const";

export async function validateImageType(fileStream: ReadableStream<Uint8Array<ArrayBuffer>>) {
  const stream = await fileTypeStream(fileStream);

  if (!stream.fileType) {
    throw new Error("Unknown file type");
  }

  if (!ALLOWED_MIME_TYPES.has(stream.fileType.mime)) {
    throw new Error("Unsupported file type");
  }

  const fileExt = stream.fileType.ext;

  if (!fileExt) {
    throw new Error("Unknown file extension");
  }

  return { stream, ext: fileExt };
}
