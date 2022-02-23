import { forwardRef, Inject, Query, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Jam } from 'src/jams/jam.model';
import { JamsService } from 'src/jams/jams.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Post } from './post.model';
import { PostsService } from './posts.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getPostUser(
    @Parent() post: Post,
  ) {
    return this.usersService.getUserById(post.userId);
  }

  @ResolveField(() => Jam, {name: 'jam', nullable: true})
  async getPostJam(
    @Parent() post: Post,
  ) {
    if (!post.jamId) return null;
    return this.jamsService.getJamById(post.jamId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post, {name: 'savePost'})
  async savePost(
    @CurrentUser() user: User,
    @Args('postId') postId: string,
    @Args('draft') draft: string,
  ) {
    const post = await this.postsService.savePost(user.id, postId, draft);
    this.pubSub.publish('savePost', {
      savePost: post,
    });
    return post;
  }
  @Subscription(() => Post, {name: 'savePost',
    filter: (payload, variables) => {
      return variables.cardIds.some(id => id === payload.savePost.id);
    }
  })
  savePostSubscription(
    @Args('cardIds', {type: () => [String]}) cardIds: string[]
  ) {
    console.log('savePostSubscription')
    return this.pubSub.asyncIterator('savePost')
  }

  @Mutation(() => [Post], {name: 'getPosts'})
  async getPosts(
    @Args('postIds', {type: () => [String]}) postIds: string[],
  ) {
    return this.postsService.getPostsByIds(postIds);
  }
}
