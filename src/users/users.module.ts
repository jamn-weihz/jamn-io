import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColsModule } from 'src/cols/cols.module';
import { LinksModule } from 'src/links/links.module';
import { PostsModule } from 'src/posts/posts.module';
import { RolesModule } from 'src/roles/roles.module';
import { SubsModule } from 'src/subs/subs.module';
import { VotesModule } from 'src/votes/votes.module';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    ColsModule,
    SubsModule,
    forwardRef(() => PostsModule),
    forwardRef(() => LinksModule),
    forwardRef(() => VotesModule),
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
