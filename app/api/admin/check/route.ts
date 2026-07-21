import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

// Used client-side by admin pages/menus to confirm admin status before
// showing anything — real enforcement still happens on every write route
// via requireAdmin(), this is purely to decide what to render.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await requireAdmin(email, sessionToken))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }
  return Response.json({ ok: true });
}
