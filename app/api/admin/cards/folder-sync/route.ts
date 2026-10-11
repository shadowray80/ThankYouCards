import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';
import { parseCardFileName } from '@/lib/cardTaxonomy';

const BUCKET = 'cards';
const PAGE_SIZE = 1000;

// Folder sync: Tim's culled card folder on his PC decides which cards are in the library.
//   action 'plan'  — given the folder's file names, work out what would change (nothing is touched)
//   action 'apply' — mark the confirmed cards as superseded (new files are uploaded by the
//                    browser via upload-url, then the normal Storage sync adds them)
export async function POST(request: NextRequest) {
  const { email, session_token, action, file_names, supersede } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  if (action === 'apply') {
    if (!Array.isArray(supersede)) return Response.json({ error: 'Missing supersede list' }, { status: 400 });
    if (supersede.length === 0) return Response.json({ superseded: 0 });
    const { data, error } = await supabaseAdmin
      .from('cards')
      .update({ superseded_at: new Date().toISOString() })
      .in('file_name', supersede)
      .is('superseded_at', null)
      .select('id');
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ superseded: data?.length ?? 0 });
  }

  if (action !== 'plan' || !Array.isArray(file_names)) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }

  const inFolder = new Set<string>(file_names.filter((n: unknown): n is string => typeof n === 'string'));

  const inStorage = new Set<string>();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list('', { limit: PAGE_SIZE, offset });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    for (const f of data ?? []) if (f.name && !f.name.startsWith('.')) inStorage.add(f.name);
    if (!data || data.length < PAGE_SIZE) break;
  }

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from('cards')
    .select('file_name, superseded_at');
  if (rowsError) return Response.json({ error: rowsError.message }, { status: 500 });

  const superseded = new Set(rows.filter(r => r.superseded_at).map(r => r.file_name as string));

  const toUpload: string[] = [];
  const badNames: string[] = [];
  const blockedSuperseded: string[] = [];
  let unchanged = 0;

  for (const name of [...inFolder].sort()) {
    if (superseded.has(name)) { blockedSuperseded.push(name); continue; }
    if (inStorage.has(name)) { unchanged++; continue; }
    if (!/^[a-z0-9_]+\.(png|jpe?g|webp)$/i.test(name) || !parseCardFileName(name)) { badNames.push(name); continue; }
    toUpload.push(name);
  }

  // Live library cards (in Storage, not already superseded) that are no longer in the folder.
  const toSupersede = [...inStorage]
    .filter(name => !inFolder.has(name) && !superseded.has(name) && parseCardFileName(name))
    .sort();

  return Response.json({ toUpload, toSupersede, unchanged, badNames, blockedSuperseded });
}
