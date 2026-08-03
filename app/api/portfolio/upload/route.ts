import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAdminSession } from '@/lib/auth/session';

// Token exchange for client-side Blob uploads from the team. portfolio
// editor. The browser uploads straight to Blob (a portfolio video would blow
// through the serverless 4.5MB body cap in a heartbeat); this route only
// mints the short-lived upload token, and only for a logged-in admin.

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!getAdminSession()) throw new Error('unauthorized');
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'image/jpeg'],
          // Hard ceiling. The editor warns at 150MB (the export standard),
          // but a warning shouldn't strand a real deliverable.
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      // Fires on Vercel after the browser finishes uploading. Nothing to do:
      // the row is only written when the admin saves the form.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: message === 'unauthorized' ? 401 : 400 });
  }
}
