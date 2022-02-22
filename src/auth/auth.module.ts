import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    UsersModule,
    EmailModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtAuthStrategy,
    JwtRefreshStrategy,
  ]
})
export class AuthModule {}
