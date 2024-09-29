import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserPayload } from '../types/user-payload.type';

export const UserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return (request.user as UserPayload) || null;
});
