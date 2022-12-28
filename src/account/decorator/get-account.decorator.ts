import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from 'src/utils/types';


export const GetAccount = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: AppRequest = ctx.switchToHttp().getRequest();
    return request.user.accountID
  },
)