import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';
import { parseCardFileName } from '@/lib/cardTaxonomy';

const BUCKET = 'cards';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, session_token } = body;

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BUCKET)
    .list('', { limit: 1000 });

  if (listError) return Response.json({ error: listError.message }, { status: 500 });

  const skipped: string[] = [];
  const rows: { file_name: string; image_url: string; category: string; subcategory: string | null; style: string }[] = [];

  for (const file of files ?? []) {
    if (!file.name || file.name.startsWith('.')) continue; // storage placeholder entries
    const parsed = parseCardFileName(file.name);
    if (!parsed) { skipped.push(file.name); continue; }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(file.name);
    rows.push({
      file_name: file.name,
      image_url: publicUrl,
      category: parsed.category,
      subcategory: parsed.subcategory,
      style: parsed.style,
    });
  }

  if (rows.length === 0) {
    return Response.json({ synced: 0, skipped });
  }

  // Upsert matched on file_name. Deliberately omits `tags` and `is_active` from the
  // payload — Postgres/PostgREST upsert only overwrites columns present in the row, so
  // existing cards keep whatever tags/active-state was set by hand in the manager, while
  // new rows get their column defaults ('{}' tags, is_active = true).
  const { error: upsertError } = await supabaseAdmin
    .from('cards')
    .upsert(rows, { onConflict: 'file_name' });

  if (upsertError) return Response.json({ error: upsertError.message }, { status: 500 });

  return Response.json({ synced: rows.length, skipped });
}
