import { Inject, UseGuards } from '@nestjs/common';
import { Args, Float, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
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
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
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
    const jam = await this.jamsService.startJam(user.id, lng, lat, name, desc);
    this.pubSub.publish('startJam', {
      startJam: jam,
    });
    return jam;
  }

  @Subscription(() => Jam, {name: 'startJam', 
    filter: (payload, variables) => true,
  })
  startJamSub() {
    console.log('startJamSubcription')
    return this.pubSub.asyncIterator('startJam');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Jam, {name: 'setJamColor'})
  async setJamColor(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
    @Args('color') color: string,
  ) {
    const jam = await this.jamsService.setJamColor(user.id, jamId, color);
    this.pubSub.publish('setJam', {
      sessionId,
      jamId,
      setJam: jam,
    });
    return jam;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Jam, {name: 'setJamIsClosed'})
  async setJamIsClosed(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
    @Args('isClosed') isClosed: boolean,
  ) {
    const jam = await this.jamsService.setJamIsClosed(user.id, jamId, isClosed);
    this.pubSub.publish('setJam', {
      sessionId,
      jamId,
      setJam: jam,
    });
    return jam;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Jam, {name: 'setJamIsPrivate'})
  async setJamIsPrivate(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
    @Args('isPrivate') isPrivate: boolean,
  ) {
    const jam = await this.jamsService.setJamIsPrivate(user.id, jamId, isPrivate);
    this.pubSub.publish('setJam', {
      sessionId,
      jamId,
      setJam: jam,
    });
    return jam;
  }

  @Subscription(() => Jam, {name: 'setJam', 
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.jamId === variables.jamId
    }
  })
  setJam(
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
  ) {
    console.log('setJamSub')
    return this.pubSub.asyncIterator('setJam')
  }
}
