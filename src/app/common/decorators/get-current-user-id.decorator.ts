import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    console.log('Decorator: GetCurrentUserId: data ==> ', data);
    // data: 'email'
    console.log('Decorator: GetCurrentUserId: request.user', request?.user);
    return request.user['sub'];
  },
);
