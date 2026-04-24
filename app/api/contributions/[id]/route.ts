import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message } = await request.json();

  const { error } = await supabaseAdmin
    .from('contributions')
    .update({ message: message ?? null })
    .eq('id', id)
    .eq('status', 'paid');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
