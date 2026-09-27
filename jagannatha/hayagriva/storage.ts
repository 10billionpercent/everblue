{"use server"};

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { env } from "cloudflare:workers";

const b2 = new S3Client({
  endpoint: env.B2_ENDPOINT,
  region: env.B2_REGION,
  credentials: {
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APPLICATION_KEY,
  },
});

export async function uploadFinalImage(
  paintingId: string,
  file: File,
) {
  const extension =
    file.name.split(".").pop() ?? "png";

  const key = `finals/${paintingId}/${crypto.randomUUID()}.${extension}`;

  const bytes = new Uint8Array(
    await file.arrayBuffer(),
  );

  await b2.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  return {
    key,
    mimeType: file.type,
  };
}

export async function deleteFinalImage(
  key: string,
) {
  await b2.send(
    new DeleteObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export function getFinalImageUrl(key: string) {
  return `${env.B2_ENDPOINT}/${env.B2_BUCKET_NAME}/${key}`;
}