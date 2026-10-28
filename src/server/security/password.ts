import { ServerConfig } from '@/server/config';
import { fromBase64Url, randomBytes, timingSafeEqual, toBase64Url, utf8 } from '@/server/security/crypto';

const ALGORITHM = 'pbkdf2_sha256';
const KEY_BITS = 256;

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, KEY_BITS);
  return new Uint8Array(bits);
}

/** Format: pbkdf2_sha256$<iterasi>$<salt>$<hash>, iterasi disimpan agar bisa dinaikkan nanti. */
export async function hashPassword(password: string): Promise<string> {
  const iterations = ServerConfig.password.iterations;
  const salt = randomBytes(16);
  const hash = await derive(password, salt, iterations);
  return [ALGORITHM, iterations, toBase64Url(salt), toBase64Url(hash)].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterationText, saltText, hashText] = stored.split('$');
  const iterations = Number(iterationText);
  if (algorithm !== ALGORITHM || !Number.isInteger(iterations) || !saltText || !hashText) return false;

  const expected = fromBase64Url(hashText);
  const actual = await derive(password, fromBase64Url(saltText), iterations);
  return timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * Hash palsu untuk login dengan email yang tidak terdaftar, supaya waktu
 * respons sama dan penyerang tidak bisa menebak email mana yang terdaftar.
 */
export function getDummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(toBase64Url(randomBytes(16)));
  return dummyHash;
}
