import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { serverEnv } from "#/lib/server.env";

const THREE_HOURS_IN_SECONDS = 3 * 60 * 60;

export const fileStorageClient = new S3Client({
  region: serverEnv.S3_REGION,
  endpoint: serverEnv.S3_ENDPOINT,
  credentials: {
    accessKeyId: serverEnv.S3_ACCESS_KEY,
    secretAccessKey: serverEnv.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const privateUploadsBucket = serverEnv.S3_BUCKET_UPLOADS;
export const publicBucket = serverEnv.S3_BUCKET_PUBLIC;

export async function getFileUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: privateUploadsBucket,
    Key: key,
  });

  const url = await getSignedUrl(fileStorageClient, command, {
    expiresIn: THREE_HOURS_IN_SECONDS,
  });

  return url;
}
