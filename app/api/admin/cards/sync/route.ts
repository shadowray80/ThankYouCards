import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';
import { parseCardFileName, autoTagsFor } from '@/lib/cardTaxonomy';

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
  const parsedRows: { file_name: string; image_url: string; category: string; subcategory: string | null; style: string }[] = [];

  for (const file of files ?? []) {
    if (!file.name || file.name.startsWith('.')) continue; // storage placeholder entries
    const parsed = parseCardFileName(file.name);
    if (!parsed) { skipped.push(file.name); continue; }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(file.name);
    parsedRows.push({
      file_name: file.name,
      image_url: publicUrl,
      category: parsed.category,
      subcategory: parsed.subcategory,
      style: parsed.style,
    });
  }

  if (parsedRows.length === 0) {
    return Response.json({ synced: 0, inserted: 0, skipped });
  }

  // Split into brand-new files vs. ones already in the table. New rows get their
  // deterministic tags applied (e.g. thank_you/mum → 'mum') as a starting point; existing
  // rows are only ever refreshed on the filename-derived columns, never `tags` or
  // `is_active` — EXCEPT an existing row whose tags are still empty gets the same
  // deterministic backfill as a new row would, since an empty array can only mean
  // "nothing's touched this yet" (a manual edit, even clearing every tag on purpose,
  // wouldn't happen — the manager only lets you toggle tags on, not empty a set that
  // already has some), never "someone deliberately chose no tags."
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('cards')
    .select('file_name, tags');

  if (existingError) return Response.json({ error: existingError.message }, { status: 500 });

  const existingTags = new Map((existing ?? []).map(r => [r.file_name, r.tags as string[]]));
  const newRows = parsedRows.filter(r => !existingTags.has(r.file_name));
  const existingRows = parsedRows.filter(r => existingTags.has(r.file_name));

  if (newRows.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('cards')
      .insert(newRows.map(r => ({ ...r, tags: autoTagsFor(r.category, r.subcategory) })));
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });
  }

  let backfilled = 0;
  if (existingRows.length > 0) {
    const untouched = existingRows.filter(r => (existingTags.get(r.file_name) ?? []).length === 0);
    const rest = existingRows.filter(r => (existingTags.get(r.file_name) ?? []).length > 0);
    backfilled = untouched.length;

    if (untouched.length > 0) {
      const { error: backfillError } = await supabaseAdmin
        .from('cards')
        .upsert(untouched.map(r => ({ ...r, tags: autoTagsFor(r.category, r.subcategory) })), { onConflict: 'file_name' });
      if (backfillError) return Response.json({ error: backfillError.message }, { status: 500 });
    }
    if (rest.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('cards')
        .upsert(rest, { onConflict: 'file_name' });
      if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  return Response.json({ synced: parsedRows.length, inserted: newRows.length, backfilled, skipped });
}
