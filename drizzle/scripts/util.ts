import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

const fileStorageClient = new S3Client({
  region: "garage",
  endpoint: process.env.GARAGE_PUBLIC_URL!,
  credentials: {
    accessKeyId: process.env.GARAGE_DEFAULT_ACCESS_KEY!,
    secretAccessKey: process.env.GARAGE_DEFAULT_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const bucket = process.env.GARAGE_DEFAULT_BUCKET!;

export function uploadFileToGarage(key: string, body: Buffer | Uint8Array | Blob | string) {
  return fileStorageClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    }),
  );
}

export async function deleteAllObjectsFromBucket() {
  let ContinuationToken;

  do {
    const listRes: ListObjectsV2CommandOutput = await fileStorageClient.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken,
      }),
    );

    const objects = (listRes.Contents || []).map((obj) => ({
      Key: obj.Key,
    }));

    if (objects.length === 0) break;

    await fileStorageClient.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
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
