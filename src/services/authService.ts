import crypto from 'crypto';
import { query } from '../db/index.ts';
import { generateUuid, hashPassword, verifyPassword } from '../utils/crypto.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'gazelle-dor-luxury-secret-key-2026';

export interface UserSession {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'guest';
  name: string;
}

export function signToken(user: UserSession): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: data.sub,
      email: data.email,
      role: data.role,
      name: data.name,
    };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
  const result = await query<{
    id: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'staff' | 'guest';
    name: string;
  }>('SELECT id, email, password_hash, role, name FROM users WHERE email = $1', [email.toLowerCase().trim()]);

  if (result.rows.length === 0) {
    throw new Error('Identifiants incorrects');
  }

  const user = result.rows[0];
  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Identifiants incorrects');
  }

  const session: UserSession = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = signToken(session);
  return { token, user: session };
}

export async function registerGuest(name: string, email: string, password: string): Promise<{ token: string; user: UserSession }> {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (existing.rows.length > 0) {
    throw new Error('Un compte existe déjà avec cette adresse email');
  }

  const id = generateUuid();
  const passwordHash = hashPassword(password);
  await query(`
    INSERT INTO users (id, email, password_hash, role, name)
    VALUES ($1, $2, $3, 'guest', $4)
  `, [id, email.toLowerCase().trim(), passwordHash, name.trim()]);

  const session: UserSession = {
    id,
    email: email.toLowerCase().trim(),
    role: 'guest',
    name: name.trim(),
  };

  return { token: signToken(session), user: session };
}
