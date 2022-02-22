import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { findDefaultWeight } from 'src/utils';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>
  ) {}

  async createVote(userId: string, linkId: string, sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Vote> {
    const vote0 = new Vote();
    vote0.userId = userId;
    vote0.linkId = linkId;
    vote0.sourcePostId = sourcePostId;
    vote0.targetPostId = targetPostId;
    vote0.clicks = clicks;
    vote0.tokens = tokens;
    vote0.weight = findDefaultWeight(clicks, tokens);
    return this.votesRepository.save(vote0);
  }

}
