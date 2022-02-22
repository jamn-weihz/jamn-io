import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import * as Enums from 'src/enums';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
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
}
