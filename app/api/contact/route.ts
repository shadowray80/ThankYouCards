import { NextRequest } from 'next/server';
import { sendContactMessage } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = (body.name ?? '').toString().trim();
  const email = (body.email ?? '').toString().trim();
  const message = (body.message ?? '').toString().trim();

  if (!name || !email || !message) {
    return Response.json({ error: 'Please fill in every field' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'That email address doesn\'t look right' }, { status: 400 });
  }

  const result = await sendContactMessage({ name, email, message });
  if (!result.ok) {
    return Response.json({ error: 'Something went wrong sending your message — please try again' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
