import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

const BUCKET = 'cards';

// Only tags/is_active/superseded are editable here — category/subcategory/style are derived
// from the filename by the sync step, not hand-edited. `superseded: false` is the Restore
// button (superseding itself happens via folder sync).
const ALLOWED_FIELDS = ['tags', 'is_active'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { email, session_token, ...fields } = body;

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) if (key in fields) update[key] = fields[key];
  if ('superseded' in fields) update.superseded_at = fields.superseded ? new Date().toISOString() : null;

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('cards')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ card: data });
}

// Delete forever: removes the image file and the library row. Only for superseded cards,
// and refused if any card people have made (or a homepage example) still uses the image —
// deleting it would break their cover.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, session_token } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from('cards')
    .select('file_name, image_url, superseded_at')
    .eq('id', id)
    .single();
  if (cardError || !card) return Response.json({ error: 'Card not found' }, { status: 404 });
  if (!card.superseded_at) return Response.json({ error: 'Only superseded cards can be deleted' }, { status: 400 });

  const [campaigns, showcase] = await Promise.all([
    supabaseAdmin.from('campaigns').select('id', { count: 'exact', head: true }).eq('card_image_url', card.image_url),
    supabaseAdmin.from('showcase_cards').select('id', { count: 'exact', head: true }).eq('card_image_url', card.image_url),
  ]);
  if (campaigns.error || showcase.error) {
    return Response.json({ error: "Couldn't check whether this image is in use — not deleted." }, { status: 500 });
  }
  const inUse = (campaigns.count ?? 0) + (showcase.count ?? 0);
  if (inUse > 0) {
    return Response.json({ error: `Used by ${inUse} card${inUse === 1 ? '' : 's'} people have made — kept so they don't break`, inUse }, { status: 409 });
  }

  const { error: fileError } = await supabaseAdmin.storage.from(BUCKET).remove([card.file_name]);
  if (fileError) return Response.json({ error: fileError.message }, { status: 500 });

  const { error } = await supabaseAdmin.from('cards').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
