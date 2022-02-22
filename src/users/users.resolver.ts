import { UseGuards } from '@nestjs/common';
import { Float, Parent, Query, ResolveField } from '@nestjs/graphql';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { User } from './user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @ResolveField(() => [Role], {name: 'roles'})
  async getUserRoles(
    @Parent() user: User,
  ) {
    return this.rolesService.getRolesByUserId(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, {name: 'getUser'})
  async(
    @CurrentUser() user: User,
  ) {
    return user;
  }
  
  @Query(() => User, {name: 'getUserByEmail', nullable: true})
  async getUserByEmail(
    @Args('email') email: string,
  ) {
    return this.usersService.getUserByEmail(email);
  }

  @Query(() => User, {name: 'getUserByName', nullable: true})
  async getUserByName(
    @Args('name') name: string,
  ) {
    return this.usersService.getUserByName(name);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'updateUserMap'})
  async updateUserMap(
    @CurrentUser() user: User,
    @Args('lng',{type: () => Float}) lng: number,
    @Args('lat',{type: () => Float}) lat: number,
    @Args('zoom',{type: () => Float}) zoom: number,
  ) {
    return this.usersService.updateUserMap(user.id, lng, lat, zoom);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserColor'})
  async setUserColor(
    @CurrentUser() user: User,
    @Args('color') color: string,
  ) {
    return this.usersService.setUserColor(user.id, color);
  }
}
