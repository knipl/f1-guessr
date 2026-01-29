import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from './jwt';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
  return request.user;
});
