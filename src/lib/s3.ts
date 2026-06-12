import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { serverEnv } from "#/env/server.env";

const THREE_HOURS_IN_SECONDS = 3 * 60 * 60;

export const fileStorageClient = new S3Client({
  region: "garage",
  endpoint: serverEnv.GARAGE_PUBLIC_URL,
  credentials: {
    accessKeyId: serverEnv.GARAGE_DEFAULT_ACCESS_KEY,
    secretAccessKey: serverEnv.GARAGE_DEFAULT_SECRET_KEY,
  },

  forcePathStyle: true,
});

export const bucket = serverEnv.GARAGE_DEFAULT_BUCKET!;

export async function getFileUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(fileStorageClient, command, {
    expiresIn: THREE_HOURS_IN_SECONDS,
  });

  return url;
}
