import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { supabaseAdmin } from '@/lib/supabase';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export const MIN_PASSWORD_LENGTH = 8;

// Stored as "scrypt$<salt hex>$<hash hex>".
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Starts a new login session for this email (one row per email, replaced on each login).
// created_at must be reset here: the 30-day expiry in sessionIsValid() is measured from it.
export async function createSession(email: string): Promise<{ session_token: string } | { error: string }> {
  const session_token = randomUUID();
  const { error } = await supabaseAdmin
    .from('organiser_sessions')
    .upsert({ email, session_token, created_at: new Date().toISOString() }, { onConflict: 'email' });
  if (error) {
    console.error('Create session error:', error);
    return { error: error.message };
  }
  return { session_token };
}
