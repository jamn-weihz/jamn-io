import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from 'src/links/links.module';
import { UsersModule } from 'src/users/users.module';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesResolver } from './votes.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => LinksModule),
    forwardRef(() => PostsModule),
    PubSubModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
