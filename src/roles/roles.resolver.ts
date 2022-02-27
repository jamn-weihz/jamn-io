import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { JamsService } from 'src/jams/jams.service';
import { Jam } from 'src/jams/jam.model';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getRoleUser(
    @Parent() role: Role,
  ) {
    return this.usersService.getUserById(role.userId);
  }

  @ResolveField(() => Jam, {name: 'jam'})
  async getRoleJam(
    @Parent() role: Role,
  ) {
    return this.jamsService.getJamById(role.jamId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'inviteRole'})
  async inviteRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('userName') userName: string,
    @Args('jamId') jamId: string,
  ) {
    const role = await this.rolesService.inviteRole(user.id, userName, jamId);
    const jam = await this.jamsService.getJamById(jamId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user,
        jam,
      }
    });

    this.pubSub.publish('jamRole', {
      sessionId,
      jamId,
      jamRole: {
        ...role,
        user,
        jam,
      },
    });

    return role;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'requestRole'})
  async requestRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
  ) {
    const role = await this.rolesService.requestRole(user.id, jamId)
    const jam = await this.jamsService.getJamById(jamId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: user.id,
      userRole: {
        ...role,
        user,
        jam,
      }
    });

    this.pubSub.publish('jamRole', {
      sessionId,
      jamId,
      jamRole: {
        ...role,
        user,
        jam
      },
    });

    return role;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'removeRole'})
  async removeRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('roleId') roleId: string,
  ) {
    const role = await this.rolesService.removeRole(user.id, roleId)
    const removedUser = await this.usersService.getUserById(role.userId);
    const jam = await this.jamsService.getJamById(role.jamId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user: removedUser,
        jam,
      }
    });

    this.pubSub.publish('jamRole', {
      sessionId,
      jamId: role.jamId,
      jamRole: {
        ...role,
        user: removedUser,
        jam
      },
    });

    return role;
  }

  @Subscription(() => Role, {name: 'userRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.userId === variables.userId;
    }
  })
  userRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('userId') userId: string,
  ) {
    return this.pubSub.asyncIterator('userRole')
  }
  @Subscription(() => Role, {name: 'jamRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.jamId === variables.jamId;
    }
  })
  jamRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('jamId') jamId: string,
  ) {
    return this.pubSub.asyncIterator('jamRole')
  }
}
