import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jam } from './jam.entity';
import { JamsService } from './jams.service';
import { JamsResolver } from './jams.resolver';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { PostsModule } from 'src/posts/posts.module';
import { LinksModule } from 'src/links/links.module';
import { VotesModule } from 'src/votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jam]),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    forwardRef(() => PostsModule),
    forwardRef(() => LinksModule),
    forwardRef(() => VotesModule),
  ],
  providers: [JamsService, JamsResolver],
  exports: [JamsService],
})
export class JamsModule {}
