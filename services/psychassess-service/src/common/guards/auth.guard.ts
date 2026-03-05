import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import * as crypto from 'crypto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Simple JWT-like auth guard for Phase 1.
 * Validates a Bearer token against a shared secret using HMAC.
 *
 * For production, replace with a proper JWT library (e.g., @nestjs/jwt + passport).
 * This guard is intentionally minimal to unblock auth-gated endpoints
 * without adding heavy dependencies.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      // If no JWT_SECRET is configured, allow all requests (dev mode)
      return true;
    }

    try {
      // Token format: base64(payload).base64(hmac)
      const [payloadB64, signatureB64] = token.split('.');
      if (!payloadB64 || !signatureB64) {
        throw new Error('Invalid token format');
      }

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(payloadB64)
        .digest('base64url');

      if (expectedSig !== signatureB64) {
        throw new Error('Invalid signature');
      }

      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

      // Check expiry
      if (payload.exp && Date.now() > payload.exp * 1000) {
        throw new Error('Token expired');
      }

      // Attach client info to request
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
