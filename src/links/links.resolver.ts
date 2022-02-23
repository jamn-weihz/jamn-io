import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Int, Subscription } from '@nestjs/graphql';
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
  @Mutation(() => Link, {name: 'linkPosts'})
  async linkPosts(
    @CurrentUser() user: User,
    @Args('sourcePostId') sourcePostId: string,
    @Args('targetPostId') targetPostId: string,
  ) {
    const link = await this.linksService.linkPosts(user.id, sourcePostId, targetPostId,1,0);
    const sourcePost = await this.postsService.getPostById(sourcePostId);
    const targetPost = await this.postsService.getPostById(targetPostId);
    this.pubSub.publish('linkPosts', {
      linkPosts: {
        ...link,
        sourcePost,
        targetPost,
      },
    });
    return link;
  }

  @Subscription(() => Link, {name: 'linkPosts',
    filter: (payload, variables) => {
      return variables.postIds.some(id => {
        return (
          id === payload.linkPosts.sourcePostId ||
          id === payload.linkPosts.targetPostId
        )
      });
    }
  })
  linkPostsSubscription(
    @Args('postIds', {type: () => [String]}) postIds: string[]
  ) {
    console.log('linkPostsSubscription');
    return this.pubSub.asyncIterator('linkPosts')
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Link, {name: 'replyPost'})
  async replyPost(
    @CurrentUser() user: User,
    @Args('sourcePostId') sourcePostId: string,
    @Args('jamId', {nullable: true}) jamId: string,
  ) {
    const link = await this.linksService.replyPost(user.id, sourcePostId, jamId);
    const sourcePost = await this.postsService.getPostById(sourcePostId);
    const targetPost = await this.postsService.getPostById(link.targetPostId);
    this.pubSub.publish('linkPosts', {
      linkPosts: {
        ...link,
        sourcePost,
        targetPost,
      },
    })
    return link;
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
