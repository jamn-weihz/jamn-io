import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User } from 'src/users/user.model';
import { Sub } from './sub.model';
import { SubsService } from './subs.service';

@Resolver(() => Sub)
export class SubsResolver {
  constructor(
    private readonly subsService: SubsService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Sub, {name: 'subPost'})
  async subPost(
    @CurrentUser() user: User,
    @Args('postId') postId: string,
  ) {
    return this.subsService.subPost(user.id, postId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Sub, {name: 'unsubPost'})
  async unsubPost(
    @CurrentUser() user: User,
    @Args('postId') postId: string,
  ) {
    return this.subsService.unsubPost(user.id, postId);
  }
}
