import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { JamsService } from 'src/jams/jams.service';
import { Jam } from 'src/jams/jam.model';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
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
    @Args('userName') userName: string,
    @Args('jamId') jamId: string,
  ) {
    return this.rolesService.inviteRole(user.id, userName, jamId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'requestRole'})
  async requestRole(
    @CurrentUser() user: User,
    @Args('jamId') jamId: string,
  ) {
    return this.rolesService.requestRole(user.id, jamId)
  }
}
