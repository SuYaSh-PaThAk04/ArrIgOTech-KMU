import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(localPath, key, contentType = "application/octet-stream") {
  const fileStream = fs.createReadStream(localPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    })
  );

  return key;
}

export async function getSignedUrlForKey(key, expiresIn = 3600) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, cmd, { expiresIn });
}
