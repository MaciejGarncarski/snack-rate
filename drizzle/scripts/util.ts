// oxlint-disable no-console
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

const fileStorageClient = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT_INTERNAL!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const bucket = process.env.S3_BUCKET_PUBLIC!;

export function uploadFileToGarage(key: string, body: Buffer | Uint8Array | Blob | string) {
  return fileStorageClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    }),
  );
}

export async function deleteAllObjectsFromBucket(bucketName: string) {
  let ContinuationToken;

  do {
    const listRes: ListObjectsV2CommandOutput = await fileStorageClient.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken,
      }),
    );

    const objects = (listRes.Contents || []).map((obj) => ({
      Key: obj.Key,
    }));

    if (objects.length === 0) break;

    await fileStorageClient.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: objects,
          Quiet: true,
        },
      }),
    );

    ContinuationToken = listRes.NextContinuationToken;
    console.log(`Deleted batch of ${objects.length}`);
  } while (ContinuationToken);

  console.log("✅ Bucket emptied");
}
