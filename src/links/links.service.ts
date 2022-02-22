import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { findDefaultWeight } from 'src/utils';
import { VotesService } from 'src/votes/votes.service';
import { Repository } from 'typeorm';
import { Link } from './link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    private readonly postsService: PostsService,
    private readonly votesService: VotesService,
  ) {}

  async getLinkById(id: string) {
    return this.linksRepository.findOne({ id });
  }

  async getLinksBySourcePostId(sourcePostId: string, offset: number): Promise<Link[]> {
    return this.linksRepository.createQueryBuilder('link')
      .select('link')
      .where('link.sourcePostId = :sourcePostId', { sourcePostId })
      .orderBy('link.weight', 'DESC')
      .limit(20)
      .offset(offset)
      .getMany()
  }

  async getLinksByTargetPostId(targetPostId: string, offset: number): Promise<Link[]> {
    return this.linksRepository.createQueryBuilder('link')
      .select('link')
      .where('link.targetPostId = :targetPostId', { targetPostId })
      .orderBy('link.weight', 'DESC')
      .limit(20)
      .offset(offset)
      .getMany()
  }

  async createLink(sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Link> {
    const link0 = new Link();
    link0.sourcePostId = sourcePostId;
    link0.targetPostId = targetPostId;
    link0.clicks = clicks;
    link0.tokens = tokens;
    link0.weight = findDefaultWeight(link0.clicks, link0.tokens);
    link0.voteI = 0;
    return this.linksRepository.save(link0);
  }

  async replyPost(userId: string, sourcePostId: string, jamId?: string): Promise<Link> {
    this.postsService.incrementPostNextCount(sourcePostId);
    const targetPost = await this.postsService.createPost(userId, jamId);
    const link = await this.createLink(sourcePostId, targetPost.id, 1, 0);
    const vote = await this.votesService.createVote(userId, link.id, sourcePostId, targetPost.id, 1, 0);
    return link;
  }

  incrementLinkVoteI(linkId: string) {
    this.linksRepository.increment({id: linkId}, 'voteI', 1);
  }
}
