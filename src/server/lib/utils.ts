import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";

export function nodeStreamFromWeb<T = Uint8Array<ArrayBufferLike>>(
  webStream: ReadableStream<T>,
): Readable {
  return Readable.fromWeb(webStream as unknown as NodeReadableStream<T>);
}
