/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private formatDate(date: Date | string | null): string | null {
    if (!date) return null;
    return new Date(date).toLocaleString('es-ES');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return null;

        // Si es un array, procesamos cada elemento
        if (Array.isArray(data)) {
          return data.map((item) => this.transformItem(item));
        }

        // Si es un objeto individual
        return this.transformItem(data);
      }),
    );
  }

  private transformItem(item: any): any {
    if (!item) return null;

    // Si el objeto ya tiene una estructura de auditoría, la respetamos
    if (item.audit) {
      return {
        ...item,
        audit: {
          createdAt: this.formatDate(item.audit.createdAt),
          updatedAt: this.formatDate(item.audit.updatedAt),
          createdBy: item.audit.createdBy,
          updatedBy: item.audit.updatedBy,
        },
      };
    }

    // Para otros tipos de datos
    return {
      ...item,
      audit: {
        createdAt: this.formatDate(item.CREATED_AT),
        updatedAt: this.formatDate(item.UPDATED_AT),
        createdBy: item.CREATED_BY
          ? {
              id: item.CREATED_BY,
              firstName: item.CREATED_BY_FIRST_NAME,
              lastName: item.CREATED_BY_LAST_NAME,
            }
          : null,
        updatedBy: item.UPDATED_BY
          ? {
              id: item.UPDATED_BY,
              firstName: item.UPDATED_BY_FIRST_NAME,
              lastName: item.UPDATED_BY_LAST_NAME,
            }
          : null,
      },
    };
  }
}
