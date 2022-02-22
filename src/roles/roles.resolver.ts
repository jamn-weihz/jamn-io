import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { forwardRef, Inject } from '@nestjs/common';
import { JamsService } from 'src/jams/jams.service';
import { Jam } from 'src/jams/jam.model';

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
}
