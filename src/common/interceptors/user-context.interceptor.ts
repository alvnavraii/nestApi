import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { REQUEST_USER_KEY } from '../constants';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id: string } }>();
    if (request?.user?.id) {
      this.cls.set(REQUEST_USER_KEY, request.user.id);
    }
    return next.handle();
  }
}
