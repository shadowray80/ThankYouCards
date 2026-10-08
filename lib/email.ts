import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? 'hello@thankyoucards.au';

// Only needed for values that come from a public form (contact message) — the other
// templates below only ever interpolate our own data (names/URLs we generated), not
// third-party input, so they don't need it.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

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

export async function sendContactMessage({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const { error } = await resend.emails.send({
    from: `thankyoucards.au <${FROM}>`,
    to: 'hellothankyoucards@gmail.com',
    replyTo: email,
    subject: `Contact form: ${name}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:1.3rem;font-weight:900;color:#3A8FA0;">thank<span style="color:#E8724A">you</span>cards<span style="color:#B0CCDC">.au</span></span>
    </div>
    <p style="font-size:.8rem;font-weight:800;color:#7A7585;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em;">From</p>
    <p style="font-size:.95rem;color:#2A2A2A;font-weight:700;margin:0 0 20px;">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p style="font-size:.8rem;font-weight:800;color:#7A7585;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em;">Message</p>
    <p style="font-size:.95rem;color:#2A2A2A;line-height:1.7;white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('Resend error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function sendLoginLink({
  to,
  loginUrl,
}: {
  to: string;
  loginUrl: string;
}) {
  const { error } = await resend.emails.send({
    from: `thankyoucards.au <${FROM}>`,
    to,
    subject: `Your thankyoucards.au login link`,
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
      Log in to your brand kit
    </h1>
    <p style="color:#7A7585;font-size:.95rem;line-height:1.6;margin:0 0 24px;">
      Click below to log in and pick up your saved colours and logo — this link works for 15 minutes and can only be used once.
    </p>

    <a href="${loginUrl}" style="display:block;background:#3A8FA0;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:800;font-size:1rem;margin-bottom:24px;">
      Log in →
    </a>

    <p style="font-size:.78rem;color:#B0A8BC;text-align:center;margin:0;">
      Didn't request this? You can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('Resend error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// "Email the card" — sent on the sender's behalf to the card's recipient. Everything the
// sender typed is escaped. Table-based layout with fixed widths and bgcolor attributes,
// because that's what renders consistently in Outlook (desktop + mobile), Gmail and Apple Mail.
export async function sendCardEmail({
  to,
  senderName,
  senderEmail,
  sendCopy,
  subject,
  heading,
  personalMessage,
  imageUrl,
  cardUrl,
}: {
  to: string;
  senderName: string;
  senderEmail?: string | null;
  sendCopy: boolean;
  subject: string;
  heading: string;
  personalMessage: string;
  imageUrl?: string | null;
  cardUrl: string;
}) {
  const name = escapeHtml(senderName);
  const messageHtml = escapeHtml(personalMessage).replace(/\r?\n/g, '<br>');
  const url = escapeHtml(cardUrl);
  const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F1EC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F4F1EC" style="background:#F4F1EC;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:100%;max-width:520px;background:#FFFFFF;border-radius:16px;">
    <tr><td align="center" style="padding:22px 20px 6px;font-family:${font};font-size:20px;font-weight:bold;color:#3A8FA0;">
      thank<span style="color:#E8724A;">you</span>cards<span style="color:#9CC0CF;">.au</span>
    </td></tr>
    <tr><td align="center" style="padding:8px 24px 18px;font-family:${font};font-size:22px;line-height:1.3;font-weight:bold;color:#2A2A2A;">
      ${escapeHtml(heading)}
    </td></tr>
    ${imageUrl ? `<tr><td align="center" style="padding:0 20px;">
      <a href="${url}" target="_blank" style="text-decoration:none;">
        <img src="${escapeHtml(imageUrl)}" width="480" alt="Open your card" style="display:block;width:100%;max-width:480px;height:auto;border:0;border-radius:12px;">
      </a>
    </td></tr>` : ''}
    <tr><td style="padding:22px 28px 6px;font-family:${font};font-size:16px;line-height:1.6;color:#3D3A44;">
      ${messageHtml}
      <br><br>
      <span style="color:#7A7585;">&mdash; ${name}</span>
    </td></tr>
    <tr><td align="center" style="padding:20px 24px 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" bgcolor="#3A8FA0" style="border-radius:10px;background:#3A8FA0;">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:${font};font-size:17px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:10px;">Open your card &rarr;</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;">
    <tr><td align="center" style="padding:16px 20px;font-family:${font};font-size:12px;line-height:1.5;color:#9A94A6;">
      ${name} sent you this card using thankyoucards.au.${senderEmail ? ` Reply to this email to reply to ${name}.` : ''}<br>
      If the button doesn't work, copy this link into your browser:<br>
      <a href="${url}" style="color:#3A8FA0;">${url}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = `${heading}\n\n${personalMessage}\n\n— ${senderName}\n\nOpen your card: ${cardUrl}\n\nSent with thankyoucards.au`;

  // Display name can't contain characters that would break the From header.
  const displayName = senderName.replace(/["<>\r\n\\]/g, '').slice(0, 60);

  const { error } = await resend.emails.send({
    from: `${displayName} via thankyoucards.au <${FROM}>`,
    to,
    ...(senderEmail ? { replyTo: senderEmail } : {}),
    ...(sendCopy && senderEmail ? { bcc: senderEmail } : {}),
    subject,
    html,
    text,
  });

  if (error) {
    console.error('Resend error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
