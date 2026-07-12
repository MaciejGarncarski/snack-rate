import { trace } from "@opentelemetry/api";
import { onError } from "@orpc/server";

// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { RPCHandler } from "@orpc/server/fetch";
import { parseFormData, type FileUpload } from "@remix-run/form-data-parser";
import { createFileRoute } from "@tanstack/react-router";
import { fileTypeStream } from "file-type";
import { nanoid } from "nanoid";

import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAXIMUM_IMAGES,
  OPTIMIZED_FORMAT,
} from "#/features/catalogue/create-snack/consts/image-const";
import { createThumbnail } from "#/features/catalogue/server/utils/create-thumbnail";
import { optimizeImage } from "#/features/catalogue/server/utils/optimize-image";
import { deletePublicFile, uploadPublicFileStream } from "#/infrastructure/s3-client";
import { logger } from "#/observability/logger/logger";
import { mapError } from "#/orpc/map-error";
import router from "#/orpc/router";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");

interface OverrideBodyContext {
  fetchRequest: Request;
}

const handler = new RPCHandler(router, {
  adapterInterceptors: [
    (options) => {
      return options.next({
        ...options,
        context: {
          ...options.context,
          // oxlint-disable-next-line typescript/no-explicit-any
          [OVERRIDE_BODY_CONTEXT as any]: {
            fetchRequest: options.request,
          },
        },
      });
    },
  ],
  rootInterceptors: [
    (options) => {
      // oxlint-disable-next-line typescript/no-explicit-any
      const { fetchRequest } = (options.context as any)[
        OVERRIDE_BODY_CONTEXT
      ] as OverrideBodyContext;

      if (!fetchRequest) {
        return options.next(options);
      }

      return options.next({
        ...options,
        request: {
          ...options.request,
          async body() {
            const contentType = fetchRequest.headers.get("content-type");
            if (contentType?.startsWith("multipart/form-data")) {
              const uploadedKeys: string[] = [];

              const formData = await parseFormData(
                fetchRequest,
                {
                  maxFiles: MAXIMUM_IMAGES,
                  maxFileSize: MAX_FILE_SIZE,
                },
                createFileUploadHandler(uploadedKeys),
              );
              return formData;
            }

            return options.request.body();
          },
        },
      });
    },
  ],
  interceptors: [
    onError((error) => {
      logger.error({ err: error, cause: (error as Error).cause }, "RPC handler error");
    }),
    async ({ next }) => {
      try {
        return await next();
      } catch (error) {
        throw mapError(error);
      }
    },
    ({ request, next }) => {
      const span = trace.getActiveSpan();

      request.signal?.addEventListener("abort", () => {
        span?.addEvent("aborted", { reason: String(request.signal?.reason) });
      });

      return next();
    },
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {},
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});

function createFileUploadHandler(uploadedKeys: string[]) {
  const fieldNameSet = new Set<string>();

  return async (fileUpload: FileUpload) => {
    fieldNameSet.add(fileUpload.fieldName);

    try {
      const { stream } = await validateImageType(fileUpload.stream());
      const key = `tmp-images/${nanoid()}.${OPTIMIZED_FORMAT}`;
      const [forMain, forThumb] = stream.tee();
      const optimized = optimizeImage(forMain as ReadableStream<Uint8Array<ArrayBuffer>>);
      const thumbnail = createThumbnail(forThumb as ReadableStream<Uint8Array>);

      const s3Upload = uploadPublicFileStream(
        key,
        optimized.stream as ReadableStream<Uint8Array<ArrayBuffer>>,
        { contentType: optimized.contentType },
      );

      const thumbKey = `tmp-images/${nanoid()}.${OPTIMIZED_FORMAT}`;

      const thumbUpload = uploadPublicFileStream(
        thumbKey,
        thumbnail.stream as ReadableStream<Uint8Array<ArrayBuffer>>,
        { contentType: thumbnail.contentType },
      );

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
  };
}

async function validateImageType(fileStream: ReadableStream<Uint8Array<ArrayBuffer>>) {
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
