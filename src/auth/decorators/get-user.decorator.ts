import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SessionUser } from "../interfaces/session-user.interface";

export const GetUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): SessionUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // vem do AuthGuard
  },
)