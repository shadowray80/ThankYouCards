import { sessionIsValid } from '@/lib/organiserSession';
import { isAdminEmail } from '@/lib/isAdminEmail';

export async function requireAdmin(email: string, sessionToken: string): Promise<boolean> {
  if (!isAdminEmail(email)) return false;
  return sessionIsValid(email, sessionToken);
}
