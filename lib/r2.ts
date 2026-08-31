import { S3Client, DeleteObjectsCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 client for the portfolio media store (2026-08-31: replaced
// Vercel Blob so the whole stack runs without a paid Vercel plan — R2 egress
// is free, which is what the ~260GB/month of video traffic needs).
//
// Server-only: this file reads secrets and must never be imported into a
// 'use client' component. The browser talks to R2 only through short-lived
// presigned PUT URLs minted by /api/portfolio/upload.
//
// Env (all five required in Vercel and .env.local):
//   R2_ACCOUNT_ID         Cloudflare account id (dash.cloudflare.com URL)
//   R2_ACCESS_KEY_ID      R2 API token key id
//   R2_SECRET_ACCESS_KEY  R2 API token secret
//   R2_BUCKET             bucket name (siv-portfolio)
//   R2_PUBLIC_BASE_URL    public serving base, no trailing slash — the
//                         bucket's pub-*.r2.dev URL for now, the custom
//                         domain once DNS moves to Cloudflare. Swapping it
//                         needs scripts/portfolio-rewrite-r2-urls.ts re-run
//                         for stored rows, plus a redeploy for new uploads.

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

let client: S3Client | null = null;
function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: required('R2_ACCESS_KEY_ID'),
        secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
      },
    });
  }
  return client;
}

export function r2PublicUrl(key: string): string {
  return `${required('R2_PUBLIC_BASE_URL')}/${key}`;
}

export function isR2Url(u: string): boolean {
  const base = process.env.R2_PUBLIC_BASE_URL;
  return !!base && u.startsWith(base + '/');
}

export function r2KeyFromUrl(u: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  return base && u.startsWith(base + '/') ? u.slice(base.length + 1) : null;
}

/** Short-lived PUT URL for a browser upload of one object. */
export async function presignR2Put(key: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: required('R2_BUCKET'), Key: key, ContentType: contentType });
  return getSignedUrl(r2(), cmd, { expiresIn: 15 * 60 });
}

/** Best-effort batch delete of R2 objects by public URL (non-R2 URLs skipped). */
export async function deleteR2Urls(urls: string[]): Promise<void> {
  const keys = urls.map(r2KeyFromUrl).filter((k): k is string => !!k);
  if (keys.length === 0) return;
  await r2().send(
    new DeleteObjectsCommand({
      Bucket: required('R2_BUCKET'),
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}

/** True if the object exists (used by the URL-rewrite migration script). */
export async function r2ObjectExists(key: string): Promise<boolean> {
  try {
    await r2().send(new HeadObjectCommand({ Bucket: required('R2_BUCKET'), Key: key }));
    return true;
  } catch {
    return false;
  }
}
