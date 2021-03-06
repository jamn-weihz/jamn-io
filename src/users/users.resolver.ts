import { UseGuards } from '@nestjs/common';
import { Float, Parent, Query, ResolveField } from '@nestjs/graphql';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Col } from 'src/cols/col.model';
import { ColsService } from 'src/cols/cols.service';
import { Lead } from 'src/leads/lead.model';
import { LeadsService } from 'src/leads/leads.service';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { Sub } from 'src/subs/sub.model';
import { SubsService } from 'src/subs/subs.service';
import { User } from './user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly colsService: ColsService,
    private readonly postsService: PostsService,
    private readonly subsService: SubsService,
    private readonly leadsService: LeadsService,
  ) {}

  @ResolveField(() => Post, {name: 'focus'})
  async getJamFocus(
    @Parent() user: User,
  ) {
    return this.postsService.getPostById(user.focusId);
  }
  @ResolveField(() => [Role], {name: 'roles'})
  async getUserRoles(
    @Parent() user: User,
  ) {
    return this.rolesService.getRolesByUserId(user.id);
  }

  @ResolveField(() => [Col], {name: 'cols'})
  async getUserCols(
    @Parent() user: User,
  ) {
    return this.colsService.getColsByUserId(user.id);
  }

  @ResolveField(() => [Sub], {name: 'subs'})
  async getUserSubs(
    @Parent() user: User,
  ) {
    return this.subsService.getSubsByUserId(user.id);
  }

  @ResolveField(() => [Lead], {name: 'leaders'})
  async getUserLeaders(
    @Parent() user: User,
  ) {
    return this.leadsService.getLeadsByFollowerUserId(user.id);
  }

  @ResolveField(() => [Lead], {name: 'followers'})
  async getUserFollowers(
    @Parent() user: User,
  ) {
    return this.leadsService.getLeadsByLeaderUserId(user.id);
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserName'})
  async setUserName(
    @CurrentUser() user: User,
    @Args('name') name: string,
  ) {
    return this.usersService.setUserName(user.id, name);
  }
}
