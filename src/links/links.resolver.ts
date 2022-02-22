import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Int } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/user.model';
import { Vote } from 'src/votes/vote.model';
import { VotesService } from 'src/votes/votes.service';
import { Link } from './link.model';
import { LinksService } from './links.service';

@Resolver(() => Link)
export class LinksResolver {
  constructor(
    private readonly linksService: LinksService,
    private readonly postsService: PostsService,
    private readonly votesService: VotesService,
  ) {}

  @ResolveField(() => Post, {name: 'sourcePost'})
  async getLinkSourcePost(
    @Parent() link: Link,
  ) {
    return this.postsService.getPostById(link.sourcePostId);
  }

  @ResolveField(() => Post, {name: 'targetPost'})
  async getLinkTargetPost(
    @Parent() link: Link,
  ) {
    return this.postsService.getPostById(link.targetPostId);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getLinkVotes(
    @Parent() link: Link,
  ) {
    return this.votesService.getVotesByLinkId(link.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Link, {name: 'replyPost'})
  async replyPost(
    @CurrentUser() user: User,
    @Args('sourcePostId') sourcePostId: string,
    @Args('jamId', {nullable: true}) jamId: string,
  ) {
    return this.linksService.replyPost(user.id, sourcePostId, jamId)
  }

  @Mutation(() => [Link], {name: 'getPrev'})
  async getPrev(
    @Args('postId') postId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.linksService.getLinksByTargetPostId(postId, offset)
  }

  @Mutation(() => [Link], {name: 'getNext'})
  async getNext(
    @Args('postId') postId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.linksService.getLinksBySourcePostId(postId, offset)
  }
}
