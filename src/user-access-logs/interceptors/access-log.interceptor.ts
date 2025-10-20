import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserAccessLogsService } from '../user-access-logs.service';
import { Request } from 'express';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private readonly userAccessLogsService: UserAccessLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const user = (request as any).user;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (user?.id) {
          try {
            await this.userAccessLogsService.createLog(
              user.id,
              this.getClientIp(request),
              request.get('User-Agent') || '',
              request.url,
              request.method,
              response.statusCode,
              responseTime,
              request.get('Referer'),
              (request as any).sessionID || '',
            );
          } catch (error) {
            console.error('Erro ao criar log de acesso:', error);
          }
        }
      }),
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
