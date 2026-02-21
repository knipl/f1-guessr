import jwt from 'jsonwebtoken';
import { verifySupabaseToken } from './jwt';

describe('verifySupabaseToken', () => {
  const secret = 'test-secret';

  it('returns user payload for valid token', async () => {
    const token = jwt.sign({ sub: 'user-123', email: 'test@example.com', role: 'authenticated' }, secret);
    const user = await verifySupabaseToken(token, secret);

    expect(user.id).toBe('user-123');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('authenticated');
  });

  it('throws when subject is missing', async () => {
    const token = jwt.sign({ email: 'test@example.com' }, secret);

    await expect(verifySupabaseToken(token, secret)).rejects.toThrow('Token missing subject');
  });

  it('throws when secret is missing', async () => {
    const token = jwt.sign({ sub: 'user-123' }, secret);

    await expect(verifySupabaseToken(token, '')).rejects.toThrow('SUPABASE_JWT_SECRET is not set');
  });
});
