import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter for Phase 1.
 * For production, replace with Redis-backed @nestjs/throttler.
 */
@Injectable()
export class ThrottleInterceptor implements NestInterceptor {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly ttl: number;
  private readonly limit: number;

  constructor(private readonly configService: ConfigService) {
    this.ttl = (this.configService.get<number>('THROTTLE_TTL') || 60) * 1000;
    this.limit = this.configService.get<number>('THROTTLE_LIMIT') || 100;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.ttl };
      this.store.set(key, entry);
    }

    entry.count++;

    if (entry.count > this.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Try again in ${retryAfter}s.`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Periodically clean up expired entries
    if (this.store.size > 10000) {
      for (const [k, v] of this.store) {
        if (now > v.resetAt) this.store.delete(k);
      }
    }

    return next.handle();
  }
}
