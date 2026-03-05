import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;
          this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
        },
        error: (error: { status?: number; message?: string }) => {
          const duration = Date.now() - now;
          const status = error.status || 500;
          this.logger.error(
            `${method} ${url} ${status} ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
