import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function isR2Configured(): boolean {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  return !!(endpoint && accessKeyId && secretAccessKey && secretAccessKey !== "YOUR_NEW_SECRET_HERE");
}

function getR2Client(): S3Client {
  if (client) return client;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

export function getR2Bucket(): string {
  return process.env.R2_BUCKET_NAME || "dpsballs";
}

export function getPublicUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    })
  );
}

export async function getFromR2(
  key: string
): Promise<{ body: Buffer; contentType?: string }> {
  const res = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    })
  );

  if (!res.Body) {
    throw new Error("Empty response from R2");
  }

  const bytes = await res.Body.transformToByteArray();
  return {
    body: Buffer.from(bytes),
    contentType: res.ContentType,
  };
}
