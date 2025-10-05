import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		const requireRoles = this.reflector.get<string[]>('roles', context.getHandler())

		if (!requireRoles) return true

		const { user } = context.switchToHttp().getRequest()
		return requireRoles.includes(user.office);
	}
}