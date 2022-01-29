import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    console.log('Decorator: GetCurrentUser: data ==> ', data);
    // data: 'email'
    console.log('Decorator: GetCurrentUser: request.user', request?.user);
    if (!data) {
      return request.user;
    }

    return request.user[data];
  },
);
