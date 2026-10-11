import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';
import { parseCardFileName } from '@/lib/cardTaxonomy';

const BUCKET = 'cards';

// Hands the admin page a one-off signed URL to upload a card image straight into the
// `cards` bucket from the browser (card PNGs can be bigger than Vercel's request limit).
// The filename must follow the naming convention, and existing files are never replaced —
// sent cards link to these images, so swapping one would change cards already made.
export async function POST(request: NextRequest) {
  const { email, session_token, file_name } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }
  if (typeof file_name !== 'string' || !/^[a-z0-9_]+\.(png|jpe?g|webp)$/i.test(file_name)) {
    return Response.json({ error: 'Must be a .png, .jpg or .webp with only letters, numbers and underscores in the name' }, { status: 400 });
  }
  if (!parseCardFileName(file_name)) {
    return Response.json({ error: "Name doesn't match category_subcategory_style_01" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(file_name);
  if (error) {
    const exists = /exist|duplicate/i.test(error.message);
    return Response.json({ error: exists ? 'Already in the library' : error.message }, { status: exists ? 409 : 500 });
  }
  return Response.json({ path: data.path, token: data.token });
}
