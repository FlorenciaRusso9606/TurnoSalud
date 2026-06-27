import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFileToS3(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'pdf'
  const key = `studies/${randomUUID()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: `inline; filename="${originalName}"`,
    })
  )

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export function extractS3Key(fileUrl: string): string {
  const url = new URL(fileUrl)
  return url.pathname.slice(1)
}

export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}
