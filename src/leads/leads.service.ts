import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    private readonly usersService: UsersService,
  ) {}

  async getLeadsByFollowerUserId(followerUserId: string) {
    return this.leadsRepository.find({
      where: {
        followerUserId,
      },
    });
  }

  async getLeadsByLeaderUserId(leaderUserId: string) {
    return this.leadsRepository.find({
      where: {
        leaderUserId,
      },
    });
  }
  
  async getLeadByFollowerUserIdAndLeaderUserId(followerUserId: string, leaderUserId: string) {
    return this.leadsRepository.findOne({
      where: {
        followerUserId,
        leaderUserId,
      },
    });
  }
  async followUser(followerUserId: string, leaderUserId: string) {
    const leaderUser = await this.usersService.getUserById(leaderUserId);
    if (!leaderUser) {
      throw new BadRequestException('This user does not exist');
    }
    const lead = await this.getLeadByFollowerUserIdAndLeaderUserId(followerUserId, leaderUserId);
    if (lead) {
      throw new BadRequestException('Already following');
    }
    const lead0 = new Lead();
    lead0.followerUserId = followerUserId;
    lead0.leaderUserId = leaderUserId;
    return this.leadsRepository.save(lead0);
  }

  async unfollowUser(followerUserId: string, leaderUserId: string) {
    const lead = await this.getLeadByFollowerUserIdAndLeaderUserId(followerUserId, leaderUserId);
    if (!lead) {
      throw new BadRequestException('This lead does not exist');
    }
    await this.leadsRepository.softDelete({id: lead.id});
    return this.leadsRepository.findOne({
      where: {
        id: lead.id,
      },
      withDeleted: true,
    });
  }

}
