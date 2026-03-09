import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const SetPublic = (): MethodDecorator & ClassDecorator =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    }
  };

export const PLAN_KEY = 'requiredPlan';
export const RequirePlan = (...plans: string[]): MethodDecorator & ClassDecorator =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(PLAN_KEY, plans, descriptor.value);
    } else {
      Reflect.defineMetadata(PLAN_KEY, plans, target);
    }
  };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (isPublic) {
      // Still try to populate user if token is present
      if (token) {
        const payload = await this.authService.validateToken(token);
        if (payload) {
          request.user = payload;
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const payload = await this.authService.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Check plan requirement
    const requiredPlans = this.reflector.getAllAndOverride<string[]>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPlans && requiredPlans.length > 0) {
      if (!requiredPlans.includes(payload.plan)) {
        throw new UnauthorizedException(
          `This feature requires one of these plans: ${requiredPlans.join(', ')}`,
        );
      }
    }

    request.user = payload;
    return true;
  }

  private extractToken(request: { headers: { authorization?: string } }): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
