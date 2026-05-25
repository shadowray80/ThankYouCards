import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? 'hello@thankyoucards.au';

export async function sendOrganiserLink({
  to,
  recipientName,
  manageUrl,
  shareUrl,
}: {
  to: string;
  recipientName: string;
  manageUrl: string;
  shareUrl: string;
}) {
  const { error } = await resend.emails.send({
    from: `thankyoucards.au <${FROM}>`,
    to,
    subject: `Your group card for ${recipientName} is live`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">

    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:1.3rem;font-weight:900;color:#3A8FA0;">thank<span style="color:#E8724A">you</span>cards<span style="color:#B0CCDC">.au</span></span>
    </div>

    <h1 style="font-size:1.4rem;font-weight:800;color:#2A2A2A;margin:0 0 8px;">
      ${recipientName}'s card is live! 🎉
    </h1>
    <p style="color:#7A7585;font-size:.95rem;line-height:1.6;margin:0 0 24px;">
      Here's your organiser link — bookmark it so you can check messages and send the card when everyone's signed.
    </p>

    <a href="${manageUrl}" style="display:block;background:#3A8FA0;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:800;font-size:1rem;margin-bottom:24px;">
      Go to your dashboard →
    </a>

    <div style="background:#F7F5FB;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="font-size:.8rem;font-weight:800;color:#7A7585;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;">Share with contributors</p>
      <p style="font-size:.85rem;color:#3A8FA0;font-weight:700;word-break:break-all;margin:0 0 10px;">${shareUrl}</p>
      <p style="font-size:.78rem;color:#7A7585;margin:0;">Forward this to anyone you want to sign the card.</p>
    </div>

    <p style="font-size:.78rem;color:#B0A8BC;text-align:center;margin:0;">
      thankyoucards.au &mdash; a card thoughtfully chosen just for you.
    </p>
  </div>
</body>
</html>`,
  });

  if (error) console.error('Resend error:', error);
}
