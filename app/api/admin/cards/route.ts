import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await requireAdmin(email, sessionToken))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('cards')
    .select('*')
    .order('category', { ascending: true })
    .order('subcategory', { ascending: true })
    .order('file_name', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ cards: data ?? [] });
}
