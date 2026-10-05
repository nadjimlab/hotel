import crypto from 'crypto';

/**
 * Enterprise-grade Password Hashing using PBKDF2 with SHA-512
 * Format: iterations:salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const iterations = parseInt(parts[0], 10);
    const salt = parts[1];
    const originalHash = parts[2];
    const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generates a standard UUID v4
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Generates a unique hotel reservation number
 * Format: LGD-YYYY-XXXXXX
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `LGD-${year}-${randomDigits}`;
}
