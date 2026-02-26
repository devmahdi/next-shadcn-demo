import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || "blog-images";
const PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || "http://localhost:9000";

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "bin";
  const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  // If S3_PUBLIC_URL is set, it already includes the bucket path (e.g. via nginx proxy)
  // Only add bucket name when using raw S3 endpoint
  if (process.env.S3_PUBLIC_URL) {
    return `${PUBLIC_URL}/${key}`;
  }
  return `${PUBLIC_URL}/${BUCKET}/${key}`;
}
