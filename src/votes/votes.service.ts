import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LinksService } from 'src/links/links.service';
import { UsersService } from 'src/users/users.service';
import { findDefaultWeight } from 'src/utils';
import { MoreThan, Not, Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
  ) {}

  async getVotesByLinkId(linkId: string) {
    return this.votesRepository.find({
      where: {
        linkId,
      },
    });
  }

  async getVoteByUserIdAndLinkId(userId:string, linkId: string) {
    return this.votesRepository.findOne({
      where: {
        userId,
        linkId,
      }
    })
  }

  async getPositiveForeignVote(userId: string, linkId: string) {
    return this.votesRepository.findOne({
      where: {
        userId: Not(userId),
        linkId,
        weight: MoreThan(0),
      }
    })
  }
  
  async createVote(userId: string, linkId: string, sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Vote> {
    const user = await this.usersService.getUserById(userId);
    this.usersService.incrementUserVoteI(userId);

    const link = await this.linksService.getLinkById(linkId);
    this.linksService.incrementLinkVoteI(linkId);

    const vote0 = new Vote();
    vote0.userId = userId;
    vote0.userI = user.voteI + 1;
    vote0.linkId = linkId;
    vote0.linkI = link.voteI + 1;
    vote0.sourcePostId = sourcePostId;
    vote0.targetPostId = targetPostId;
    vote0.clicks = clicks;
    vote0.tokens = tokens;
    vote0.weight = findDefaultWeight(clicks, tokens);
    return this.votesRepository.save(vote0);
  }

  async deleteVote(voteId: string) {
    const vote0 = new Vote();
    vote0.id = voteId;
    vote0.deleteDate = new Date();
    return this.votesRepository.save(vote0);
  }

}
