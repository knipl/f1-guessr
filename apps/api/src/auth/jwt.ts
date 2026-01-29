import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export function verifySupabaseToken(token: string, secret: string): AuthUser {
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not set');
  }

  const payload = jwt.verify(token, secret) as JwtPayload;
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
