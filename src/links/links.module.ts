import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinksService } from './links.service';
import { LinksResolver } from './links.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { VotesModule } from 'src/votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link]),
    PostsModule,
    VotesModule,
  ],
  providers: [LinksService, LinksResolver],
  exports: [LinksService],
})
export class LinksModule {}
