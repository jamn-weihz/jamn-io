import { Inject } from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CurrentUser } from 'src/auth/gql-auth.guard';
import { Link } from 'src/links/link.model';
import { LinksService } from 'src/links/links.service';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { Vote } from './vote.model';
import { VotesService } from './votes.service';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(
    private readonly votesService: VotesService,
    private readonly postsService: PostsService,
    private readonly linksService: LinksService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => Post, {name: 'sourcePost'})
  async getLinkSourcePost(
    @Parent() vote: Vote,
    @CurrentUser() user: User,
  ) {
    return this.postsService.getPostByIdWithPrivacy(user?.id, vote.sourcePostId);
  }

  @ResolveField(() => Post, {name: 'targetPost'})
  async getVoteTargetPost(
    @Parent() vote: Vote,
    @CurrentUser() user: User,
  ) {
    return this.postsService.getPostByIdWithPrivacy(user?.id, vote.targetPostId);
  }

  @ResolveField(() => Link, {name: 'link'})
  async getVoteLink(
    @Parent() vote: Vote,
  ) {
    const link = await this.linksService.getLinkById(vote.linkId);
    console.log('link', link)
    return link;
  }

  @Mutation(() => [Vote], {name: 'getRecentUserVotes'})
  async getRecentUserVotes(
    @Args('userId') userId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.votesService.getRecentUserVotes(userId, offset);
  }

  @Subscription(() => Vote, {name: 'userVote', 
    filter: (payload, variables) => {
      return payload.userId === variables.userId;
    }
  })
  userVote(
    @Args('userId') userId: string,
  ) {
    return this.pubSub.asyncIterator('userVote');
  }
}
