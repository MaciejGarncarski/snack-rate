import { Readable } from "node:stream";

export function nodeStreamFromWeb<T = Uint8Array<ArrayBufferLike>>(
  webStream: ReadableStream<T>,
): Readable {
  const reader = webStream.getReader();

  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      this.push(done ? null : value);
    },
  });
}
