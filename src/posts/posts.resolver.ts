import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { JamsService } from 'src/jams/jams.service';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Post } from './post.model';
import { PostsService } from './posts.service';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getPostUser(
    @Parent() post: Post,
  ) {
    return this.usersService.getUserById(post.userId);
  }

  @ResolveField(() => User, {name: 'jam'})
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
    return this.postsService.savePost(user.id, postId, draft);
  }
}
