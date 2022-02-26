import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import * as Enums from 'src/enums';
import { UsersService } from 'src/users/users.service';
import { JamsService } from 'src/jams/jams.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
  ) {}

  async createRole(userId: string, jamId: string, type: Enums.RoleType): Promise<Role> {
    const role0 = new Role();
    role0.userId = userId;
    role0.jamId = jamId;
    role0.type = type;
    return this.rolesRepository.save(role0);
  }

  async getRolesByUserId(userId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        userId,
      },
    });
  }
  
  async getRolesByJamId(jamId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        jamId,
      },
    });
  }

  async getRoleByUserIdAndJamId(userId: string, jamId: string): Promise<Role> {
    return this.rolesRepository.findOne({
      where: {
        userId,
        jamId,
      },
    });
  }

  async inviteRole(invitingUserId: string, invitedUserName: string, jamId: string): Promise<Role> {
    const jam = await this.jamsService.getJamById(jamId);
    if (!jam) {
      throw new BadRequestException('This jam does not exist');
    }
    const invitingRole = await this.getRoleByUserIdAndJamId(invitingUserId, jamId);
    if (
      !invitingRole ||  
      (invitingRole.type !== Enums.RoleType.ADMIN &&
      invitingRole.type !== Enums.RoleType.MEMBER)
    ) {
      throw new BadRequestException('Insufficient privileges');
    }
    const invitedUser = await this.usersService.getUserByName(invitedUserName);
    if (!invitedUser) {
      throw new BadRequestException('This user does not exist');
    }
    const invitedRole = await this.getRoleByUserIdAndJamId(invitedUser.id, jamId);
    if (invitedRole) {
      if (invitedRole.isInvited) {
        if (invitedRole.isRequested) {
          throw new BadRequestException('This user is already part of the jam')
        }
        else {
          throw new BadRequestException('This user has already been invited')
        }
      }
      else if (invitedRole.isRequested) {
        const role0 = new Role();
        role0.id = invitedRole.id;
        role0.isInvited = true;
        await this.rolesRepository.save(role0);
        return this.getRoleByUserIdAndJamId(invitedUser.id, jamId);
      }
    }
    else {
      const role0 = new Role();
      role0.isInvited = true;
      role0.isRequested = false;
      role0.jamId = jamId;
      role0.userId = invitedUser.id;
      await this.rolesRepository.save(role0);
      return this.getRoleByUserIdAndJamId(invitedUser.id, jamId);
    }
  }

  async requestRole(userId: string, jamId: string): Promise<Role> {
    const role = await this.getRoleByUserIdAndJamId(userId, jamId);
    if (role) {
      const role0 = new Role();
      role0.id = role.id;
      role0.isRequested = true;
      await this.rolesRepository.save(role0);
    }
    else {
      const jam = await this.jamsService.getJamById(jamId);
      if (!jam) {
        throw new BadRequestException('This jam does not exist')
      }
      const role0 = new Role();
      role0.userId = userId;
      role0.jamId = jamId;
      role0.isRequested = true;
      role0.isInvited = jam.isOpen;
      await this.rolesRepository.save(role0);
    }
    return this.getRoleByUserIdAndJamId(userId, jamId);
  }
}
