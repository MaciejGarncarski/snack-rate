import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { serverEnv } from "#/lib/server.env";

const s3UploadClient = new S3Client({
  region: serverEnv.S3_REGION,
  endpoint: serverEnv.S3_ENDPOINT_INTERNAL,
  credentials: {
    accessKeyId: serverEnv.S3_ACCESS_KEY,
    secretAccessKey: serverEnv.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const publicBucket = serverEnv.S3_BUCKET_PUBLIC;

export async function uploadPublicFile(key: string, body: Buffer) {
  await s3UploadClient.send(
    new PutObjectCommand({
      Bucket: publicBucket,
      Key: key,
      Body: body,
    }),
  );
}

export async function deletePublicFile(key: string) {
  await s3UploadClient.send(
    new DeleteObjectCommand({
      Bucket: publicBucket,
      Key: key,
    }),
  );
}

export function getPublicFileUrl(key: string): string {
  return `${serverEnv.S3_ENDPOINT}/${key}`;
}
