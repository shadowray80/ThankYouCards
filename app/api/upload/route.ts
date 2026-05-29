import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
  if (!file.type.startsWith('image/')) return Response.json({ error: 'File must be an image' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: 'Image must be under 8MB' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from('contribution-photos')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error('Storage upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('contribution-photos')
    .getPublicUrl(path);

  return Response.json({ url: publicUrl });
}
