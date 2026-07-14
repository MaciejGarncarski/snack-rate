import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT_INTERNAL,
  region: process.env.S3_REGION ?? "garage",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

const bucket = process.env.S3_BUCKET_PUBLIC ?? "";
const THUMB_WIDTH = 300;

interface ImageJob {
  key: string;
}

export async function handleImageProcessing(job: ImageJob): Promise<{ thumbnailKey: string }> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: job.key,
    }),
  );

  const buffer = Buffer.from(await response.Body!.transformToByteArray());

  const thumbnail = await sharp(buffer).resize(THUMB_WIDTH).webp({ quality: 80 }).toBuffer();

  const thumbnailKey = `thumbnails/${job.key}`.replace(/\.\w+$/u, ".webp");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: "image/webp",
    }),
  );

  return { thumbnailKey };
}
