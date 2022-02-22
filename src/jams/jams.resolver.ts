import { UseGuards } from '@nestjs/common';
import { Args, Float, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Jam } from './jam.model';
import { JamsService } from './jams.service';

@Resolver(() => Jam)
export class JamsResolver {
  constructor(
    private readonly jamsService: JamsService,
    private readonly rolesService: RolesService,
    private readonly postsService: PostsService,
  ) {}

  @ResolveField(() => [Role], {name: 'roles'})
  async getJamRoles(
    @Parent() jam: Jam,
  ) {
    return this.rolesService.getRolesByJamId(jam.id);
  }

  @ResolveField(() => Post, {name: 'focus'})
  async getJamFocus(
    @Parent() jam: Jam,
  ) {
    return this.postsService.getPostById(jam.focusId);
  }

  @Query(() => Jam, {name: 'getJamByName', nullable: true})
  async getJamByName(
    @Args('name') name: string,
  ) {
    return this.jamsService.getJamByName(name);
  }

  @Query(() => [Jam], {name: 'getJamsByLocation'})
  async getJamsByLocation(
    @Args('lng', {type: () => Float}) lng: number,
    @Args('lat', {type: () => Float}) lat: number,
    @Args('zoom', {type: () => Float}) zoom: number,
  ) {
    return this.jamsService.getJamsByLocation(lng, lat, zoom);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Jam, {name: 'startJam'})
  async startJam(
    @CurrentUser() user: User,
    @Args('lng', {type: () => Float}) lng: number,
    @Args('lat', {type: () => Float}) lat: number,
    @Args('name') name: string,
    @Args('desc') desc: string,
  ) {
    return this.jamsService.startJam(user.id, lng, lat, name, desc);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Jam, {name: 'setJamColor'})
  async setJamColor(
    @CurrentUser() user: User,
    @Args('jamId') jamId: string,
    @Args('color') color: string,
  ) {
    return this.jamsService.setJamColor(user.id, jamId, color);
  }
}
