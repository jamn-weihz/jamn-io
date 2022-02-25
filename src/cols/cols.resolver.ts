import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Col, {name: 'saveCol'})
  async saveCol(
    @CurrentUser() user: User,
    @Args('colId') colId: string,
    @Args('pathname') pathname: string,
  ) {
    return this.colsService.saveCol(user.id, colId, pathname);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Col], {name: 'removeCol'})
  async removeCol(
    @CurrentUser() user: User,
    @Args('colId') colId: string,
  ) {
    return this.colsService.removeCol(user.id, colId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Col], {name: 'shiftCol'})
  async shiftCol(
    @CurrentUser() user: User,
    @Args('colId') colId: string,
    @Args('di', {type: () => Int}) di: number
  ) {
    return this.colsService.shiftCol(user.id, colId, di)
  }

}
