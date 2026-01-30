import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser, verifySupabaseToken } from './jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!headerValue?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = headerValue.slice('Bearer '.length);

    try {
      const user = verifySupabaseToken(token, process.env.SUPABASE_JWT_SECRET || '');
      (request as Request & { user?: AuthUser }).user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
