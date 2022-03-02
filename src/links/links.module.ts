import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinksService } from './links.service';
import { LinksResolver } from './links.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { VotesModule } from 'src/votes/votes.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from 'src/roles/roles.module';
import { JamsModule } from 'src/jams/jams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link]),
    forwardRef(() => UsersModule),
    forwardRef(() => JamsModule),
    forwardRef(() => PostsModule),
    RolesModule,
    VotesModule,
    PubSubModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_ACCESS_TOKEN_SECRET')
        }
      },
    }),
  ],
  providers: [LinksService, LinksResolver],
  exports: [LinksService],
})
export class LinksModule {}
