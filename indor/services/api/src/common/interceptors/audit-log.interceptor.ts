import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    // Only audit write operations from admin/provider
    if (
      !user ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ||
      !['admin', 'provider'].includes(user.role)
    ) {
      return next.handle();
    }

    const action = `${method.toLowerCase()}.${context.getClass().name}`;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action,
              entityType: context.getClass().name.replace('Controller', '').toLowerCase(),
              entityId: request.params?.id || response?.id || 'unknown',
              metadata: {
                method,
                path: request.url,
                body: this.sanitize(request.body),
              },
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch {
          // Audit log failure should not break the request
        }
      }),
    );
  }

  private sanitize(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    // Never log sensitive fields
    delete sanitized.password;
    delete sanitized.passwordHash;
    delete sanitized.refreshToken;
    delete sanitized.stripeIntentId;
    return sanitized;
  }
}
