import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinksService } from './links.service';
import { LinksResolver } from './links.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { VotesModule } from 'src/votes/votes.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link]),
    PostsModule,
    VotesModule,
    PubSubModule,
  ],
  providers: [LinksService, LinksResolver],
  exports: [LinksService],
})
export class LinksModule {}
