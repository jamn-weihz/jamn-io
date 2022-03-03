import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Lead } from './lead.model';
import { LeadsService } from './leads.service';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub, 
  ) {}

  @ResolveField(() => User, {name: 'leaderUser'})
  async getLeadLeaderUser(
    @Parent() lead: Lead,
  ) {
    return this.usersService.getUserById(lead.leaderUserId);
  }

  @ResolveField(() => User, {name: 'followerUser'})
  async getLeadFollowerUser(
    @Parent() lead: Lead,
  ) {
    return this.usersService.getUserById(lead.followerUserId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Lead, {name: 'followUser'})
  async followUser(
    @CurrentUser() user: User,
    @Args('userId') userId: string,
  ) {
    const lead = await this.leadsService.followUser(user.id, userId);
    this.pubSub.publish('lead', {
      leaderUserId: lead.leaderUserId,
      followerUserId: lead.followerUserId,
      lead,
    });
    return lead;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Lead, {name: 'unfollowUser'})
  async unfollowUser(
    @CurrentUser() user: User,
    @Args('userId') userId: string,
  ) {
    const lead = await this.leadsService.unfollowUser(user.id, userId);
    this.pubSub.publish('lead', {
      leaderUserId: lead.leaderUserId,
      followerUserId: lead.followerUserId,
      lead,
    });
    return lead;
  }

  @Subscription(() => Lead, {name: 'lead',
    filter: (payload, variables) => {
      return (
        payload.leaderUserId === variables.userId || 
        payload.followerUserId === variables.userId
      );
    }
  })
  leadSubscription(
    @Args('userId') userId: string,
  ) {
    console.log('leadSubscription')
    return this.pubSub.asyncIterator('lead'); 
  }
}
