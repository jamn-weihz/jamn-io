import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GqlAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  intercept(context: any, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const token = ctx.getContext().req?.cookies.Authentication;
    const payload = this.jwtService.decode(token) as any;

    if (payload?.userId) {
      const user = this.usersService.getUserById(payload.userId);
      ctx.getContext().req.user = user;
    }
    return next.handle()
  }
}