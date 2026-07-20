// One-off / re-runnable sync: uploads everything in Images/cards/<folder>/*
// to a public Supabase Storage bucket, then writes a JSON map of
// { folderName: [publicUrl, ...] } so it can be folded into lib/themes.ts.
//
// Run with:  node --env-file=.env.local scripts/sync-theme-images.mjs

import { createClient } from '@supabase/supabase-js';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const SOURCE_DIR = 'F:/Thankyoucards/Images/cards';
const BUCKET = 'theme-images';
const OUT_FILE = path.join(process.cwd(), 'scripts', 'theme-image-urls.json');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (!buckets.some(b => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createError) throw createError;
    console.log(`Created bucket "${BUCKET}"`);
  }
}

async function main() {
  await ensureBucket();

  const folders = readdirSync(SOURCE_DIR)
    .filter(f => statSync(path.join(SOURCE_DIR, f)).isDirectory())
    .sort();

  const result = {};

  for (const folder of folders) {
    const dir = path.join(SOURCE_DIR, folder);
    const files = readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    if (files.length === 0) { console.log(`${folder}: skipped (no images)`); continue; }

    const urls = [];
    for (const file of files) {
      const buf = readFileSync(path.join(dir, file));
      const destPath = `${folder}/${file}`;
      const { error } = await supabase.storage.from(BUCKET).upload(destPath, buf, {
        contentType: 'image/jpeg', // files are named .png but are actually JPEG data
        upsert: true,
      });
      if (error) { console.error(`  ✗ ${destPath}: ${error.message}`); continue; }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
      urls.push(data.publicUrl);
    }

    result[folder] = urls;
    console.log(`${folder}: uploaded ${urls.length}/${files.length}`);
  }

  writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${OUT_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
