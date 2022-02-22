import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User } from 'src/users/user.model';
import { Col } from './col.model';
import { ColsService } from './cols.service';

@Resolver()
export class ColsResolver {
  constructor(
    private readonly colsService: ColsService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Col, {name: 'addCol'})
  async addCol(
    @CurrentUser() user: User,
    @Args('pathname') pathname: string,
  ) {
    return this.colsService.addCol(user.id, pathname);
  }
}
