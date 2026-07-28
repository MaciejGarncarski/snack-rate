import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { type Readable } from "node:stream";

import { serverEnv } from "#/lib/server.env";

const s3UploadClient = new S3Client({
  region: serverEnv.S3_REGION,
  endpoint: serverEnv.S3_ENDPOINT_INTERNAL,
  credentials: {
    accessKeyId: serverEnv.S3_ACCESS_KEY,
    secretAccessKey: serverEnv.S3_SECRET_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
});

export const PUBLIC_BUCKET = serverEnv.S3_BUCKET_PUBLIC;

export async function uploadPublicFile(key: string, body: Buffer) {
  await s3UploadClient.send(
    new PutObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: key,
      Body: body,
    }),
  );
}

export async function uploadPublicFileStream(
  key: string,
  stream: Readable,
  options?: { contentType?: string },
) {
  const upload = new Upload({
    client: s3UploadClient,
    params: {
      Bucket: PUBLIC_BUCKET,
      Key: key,
      Body: stream,
      ContentType: options?.contentType,
    },
  });

  await upload.done();
}

export async function deletePublicFile(key: string) {
  await s3UploadClient.send(
    new DeleteObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: key,
    }),
  );
}

export async function getPublicFileStream(key: string) {
  const { Body, ContentType, ContentLength } = await s3UploadClient.send(
    new GetObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: key,
    }),
  );

  if (!Body) {
    throw new Error("Object has no body");
  }

  return {
    stream: Body as Readable,
    contentType: ContentType,
    contentLength: ContentLength,
  };
}

export async function copyPublicFile(oldKey: string, newKey: string) {
  await s3UploadClient.send(
    new CopyObjectCommand({
      Bucket: PUBLIC_BUCKET,
      CopySource: `${PUBLIC_BUCKET}/${encodeURIComponent(oldKey)}`,
      Key: newKey,
    }),
  );
}

export async function movePublicFile(oldKey: string, newKey: string) {
  await copyPublicFile(oldKey, newKey);
  await deletePublicFile(oldKey);
}

export function getPublicFileUrl(key: string): string {
  return `${serverEnv.S3_ENDPOINT}/${key}`;
}
