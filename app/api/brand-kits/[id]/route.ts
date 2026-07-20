import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sessionIsValid } from '@/lib/organiserSession';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, session_token } = await request.json();

  if (!(await sessionIsValid(email, session_token))) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('brand_kits')
    .delete()
    .eq('id', id)
    .eq('email', email);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
