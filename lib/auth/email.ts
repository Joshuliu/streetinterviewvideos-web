import { Resend } from 'resend';

// OTP emails go through Resend (transactional) ONLY — never any cold-email
// infrastructure (spec §Auth 5). With no RESEND_API_KEY set (local dev), the
// code is logged to the server console instead so login flows stay testable.

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OTP_FROM_EMAIL ?? 'login@streetinterviewvideos.com';

  if (!apiKey) {
    console.log(`[auth] DEV MODE — login code for ${to}: ${code}`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `StreetInterviewVideos <${from}>`,
    to,
    subject: `${code} is your StreetInterviewVideos login code`,
    text: [
      `Your login code is: ${code}`,
      '',
      'It expires in 10 minutes. If you did not request it, ignore this email.',
      '',
      'StreetInterviewVideos.com',
    ].join('\n'),
  });
  if (error) {
    console.error('[auth] Resend send failed:', error);
    throw new Error('otp_send_failed');
  }
}
