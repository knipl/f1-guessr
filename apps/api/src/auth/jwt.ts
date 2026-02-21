import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

let jwks: ReturnType<Awaited<ReturnType<typeof importJose>>['createRemoteJWKSet']> | null = null;

async function importJose() {
  return import('jose');
}

function decodeJwtHeader(token: string): { alg?: string } {
  const [headerPart] = token.split('.');
  if (!headerPart) {
    return {};
  }

  const decoded = Buffer.from(headerPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  try {
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

async function getJwks() {
  if (jwks) {
    return jwks;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not set');
  }

  const { createRemoteJWKSet } = await importJose();
  jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
  return jwks;
}

export async function verifySupabaseToken(token: string, secret: string): Promise<AuthUser> {
  const header = decodeJwtHeader(token);
  const algorithm = header.alg;

  if (algorithm?.startsWith('HS')) {
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET is not set');
    }

    const payload = jwt.verify(token, secret) as { sub?: string; email?: string; role?: string };
    const sub = payload.sub;

    if (!sub) {
      throw new Error('Token missing subject');
    }

    return {
      id: sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined
    };
  }

  const { jwtVerify } = await importJose();
  const { payload } = await jwtVerify(token, await getJwks(), {
    issuer: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1` : undefined
  });

  if (!payload.sub) {
    throw new Error('Token missing subject');
  }

  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    role: typeof payload.role === 'string' ? payload.role : undefined
  };
}
