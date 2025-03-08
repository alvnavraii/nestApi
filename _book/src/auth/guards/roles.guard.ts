/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Is Public?:', isPublic);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndMerge<number[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Required Roles:', requiredRoles);

    const { user } = context.switchToHttp().getRequest();
    console.log('User object:', JSON.stringify(user, null, 2));

    if (!user) return false;

    const userRoleId = user.role?.id;

    if (!userRoleId) {
      console.log('No user role found');
      return false;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('No required roles specified');
      return true;
    }

    const hasRole = requiredRoles.includes(userRoleId);
    console.log(
      `User roleId: ${userRoleId}, Required roles: ${requiredRoles.join(',')}, Has role: ${hasRole}`,
    );

    return hasRole;
  }
}
