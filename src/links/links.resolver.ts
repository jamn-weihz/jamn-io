import { Inject, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Int, Subscription, Context } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { Vote } from 'src/votes/vote.model';
import { VotesService } from 'src/votes/votes.service';
import { Link } from './link.model';
import { LinksService } from './links.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GqlAuthInterceptor } from 'src/auth/gql-auth.interceptor';

@Resolver(() => Link)
export class LinksResolver {
  constructor(
    private readonly linksService: LinksService,
    private readonly postsService: PostsService,
    private readonly votesService: VotesService,
    @Inject(PUB_SUB) 
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => Post, {name: 'sourcePost'})
  async getLinkSourcePost(
    @Parent() link: Link,
    @CurrentUser() user: User,
  ) {
    return this.postsService.getPostByIdWithPrivacy(user?.id, link.sourcePostId);
  }

  @ResolveField(() => Post, {name: 'targetPost'})
  async getLinkTargetPost(
    @Parent() link: Link,
    @CurrentUser() user: User,
  ) {
    return this.postsService.getPostByIdWithPrivacy(user?.id, link.targetPostId);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getLinkVotes(
    @Parent() link: Link,
  ) {
    if (link.deleteDate) return [];
    return this.votesService.getVotesByLinkId(link.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Link, {name: 'linkPosts'})
  async linkPosts(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('sourcePostId') sourcePostId: string,
    @Args('targetPostId') targetPostId: string,
  ) {
    const link = await this.linksService.linkPosts(user.id, sourcePostId, targetPostId, 1, 0);
    const sourcePost = await this.postsService.getPostById(sourcePostId);
    const targetPost = await this.postsService.getPostById(targetPostId);
    const votes = await this.votesService.getVotesByLinkId(link.id);
    this.pubSub.publish('linkPosts', {
      sessionId,
      linkPosts: {
        ...link,
        sourcePost,
        targetPost,
        votes,
      },
    });
    return link;
  }

  @Subscription(() => Link, {name: 'linkPosts',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return variables.postIds.some(id => {
        return (
          id === payload.linkPosts.sourcePostId ||
          id === payload.linkPosts.targetPostId
        )
      });
    }
  })
  linkPostsSubscription(
    @Args('sessionId') sessionId: string,
    @Args('postIds', {type: () => [String]}) postIds: string[]
  ) {
    console.log('linkPostsSubscription');
    return this.pubSub.asyncIterator('linkPosts')
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Link, {name: 'votePosts'})
  async votePosts(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('linkId') linkId: string,
    @Args('clicks', {type: () => Int}) clicks: number,
  ) {
    const link = await this.linksService.votePosts(user.id, linkId, clicks, 0);
    const sourcePost = await this.postsService.getPostById(link.sourcePostId);
    const targetPost = await this.postsService.getPostById(link.targetPostId);
    const votes = await this.votesService.getVotesByLinkId(link.id);
    this.pubSub.publish('linkPosts', {
      sessionId,
      linkPosts: {
        ...link,
        sourcePost,
        targetPost,
        votes,
      }
    });
    return link;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Link, {name: 'replyPost'})
  async replyPost(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('sourcePostId') sourcePostId: string,
    @Args('jamId', {nullable: true}) jamId: string,
  ) {
    const link = await this.linksService.replyPost(user.id, sourcePostId, jamId);
    const sourcePost = await this.postsService.getPostById(sourcePostId);
    const targetPost = await this.postsService.getPostById(link.targetPostId);
    const votes = await this.votesService.getVotesByLinkId(link.id);
    this.pubSub.publish('linkPosts', {
      sessionId,
      linkPosts: {
        ...link,
        sourcePost,
        targetPost,
        votes,
      },
    })
    return link;
  }

  @UseInterceptors(GqlAuthInterceptor)
  @Mutation(() => [Link], {name: 'getPrev'})
  async getPrev(
    @Args('postId') postId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.linksService.getLinksByTargetPostId(postId, offset)
  }

  @UseInterceptors(GqlAuthInterceptor)
  @Mutation(() => [Link], {name: 'getNext'})
  async getNext(
    @Args('postId') postId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.linksService.getLinksBySourcePostId(postId, offset)
  }
}
