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

// Starts a new login session — one row per login, so each device stays logged in on its own.
// Expired sessions for this email are cleared out at the same time (30-day expiry, measured
// from created_at in sessionIsValid()).
export async function createSession(email: string): Promise<{ session_token: string } | { error: string }> {
  const session_token = randomUUID();
  await supabaseAdmin
    .from('organiser_sessions')
    .delete()
    .eq('email', email)
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const { error } = await supabaseAdmin
    .from('organiser_sessions')
    .insert({ email, session_token, created_at: new Date().toISOString() });
  if (error) {
    console.error('Create session error:', error);
    return { error: error.message };
  }
  return { session_token };
}
