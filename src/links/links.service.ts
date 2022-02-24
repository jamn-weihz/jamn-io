import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly votesService: VotesService,
  ) {}

  async getLinkById(id: string) {
    return this.linksRepository.findOne({ id });
  }

  async getLinkBySourcePostIdAndTargetPostId(sourcePostId: string, targetPostId: string) {
    return this.linksRepository.findOne({
      where: {
        sourcePostId,
        targetPostId,
      },
    });
  }

  async getLinksBySourcePostId(sourcePostId: string, offset: number): Promise<Link[]> {
    return this.linksRepository.createQueryBuilder('link')
      .select('link')
      .where('link.sourcePostId = :sourcePostId', { sourcePostId })
      .orderBy('link.weight', 'DESC')
      .limit(10)
      .offset(offset)
      .getMany()
  }

  async getLinksByTargetPostId(targetPostId: string, offset: number): Promise<Link[]> {
    return this.linksRepository.createQueryBuilder('link')
      .select('link')
      .where('link.targetPostId = :targetPostId', { targetPostId })
      .orderBy('link.weight', 'DESC')
      .limit(10)
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
    this.postsService.incrementPostNextCount(sourcePostId, 1);
    const targetPost = await this.postsService.createPost(userId, jamId, '', '');
    const link = await this.createLink(sourcePostId, targetPost.id, 1, 0);
    const vote = await this.votesService.createVote(userId, link.id, sourcePostId, targetPost.id, 1, 0);
    return link;
  }

  async linkPosts(userId: string, sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Link> {
    let link = await this.getLinkBySourcePostIdAndTargetPostId(sourcePostId, targetPostId);
    if (!link) {
      const posts = await this.postsService.getPostsByIds([sourcePostId, targetPostId]);
      if (posts.length !== 2) return null;
      this.postsService.incrementPostNextCount(sourcePostId, 1);
      this.postsService.incrementPostPrevCount(targetPostId, 1);
      link = await this.createLink(sourcePostId, targetPostId, clicks, tokens);
    }
    let dClicks = clicks;
    let dTokens = tokens;
    let dWeight = findDefaultWeight(clicks, tokens);
    let vote = await this.votesService.getVoteByUserIdAndLinkId(userId, link.id);
    if (vote) {
      dClicks -= vote.clicks;
      dTokens -= vote.tokens;
      dWeight -= vote.weight;
      const oldVote = await this.votesService.deleteVote(vote.id);
    }
    if (dClicks === 0 && dTokens === 0 && dWeight === 0) {
      return link;
    }
    else {
      await this.linksRepository.increment({id: link.id}, 'clicks', dClicks);
      await this.linksRepository.increment({id: link.id}, 'tokens', dTokens);
      await this.linksRepository.increment({id: link.id}, 'weight', dWeight);
    }
    const newVote = await this.votesService.createVote(userId, link.id, sourcePostId, targetPostId, clicks, tokens);
    return this.getLinkById(link.id);
  }

  async votePosts(userId: string, linkId: string, clicks: number, tokens: number) {
    const link = await this.getLinkById(linkId);
    if (!link) {
      return null;
    }
    let dClicks = clicks;
    let dTokens = tokens;
    let dWeight = findDefaultWeight(clicks, tokens);
    let vote = await this.votesService.getVoteByUserIdAndLinkId(userId, linkId);
    if (vote) {
      dClicks -= vote.clicks;
      dTokens -= vote.tokens;
      dWeight -= vote.weight;
      const oldVote = await this.votesService.deleteVote(vote.id);
    }

    if (dClicks === 0 && dTokens === 0 && dWeight === 0) {
      return link;
    }
    else {
      await this.linksRepository.increment({id: linkId}, 'clicks', dClicks);
      await this.linksRepository.increment({id: linkId}, 'tokens', dTokens);
      await this.linksRepository.increment({id: linkId}, 'weight', dWeight);
    }
    const newVote = await this.votesService.createVote(userId, linkId, link.sourcePostId, link.targetPostId, clicks, tokens);
    const link1 = await this.getLinkById(linkId);
    if (link1.clicks === 0 && link1.tokens === 0 && link1.weight === 0) {
      const foreignVote = await this.votesService.getPositiveForeignVote(userId, linkId);
      if (!foreignVote) {
        return this.deleteLink(linkId);
      }
    }
    return link1;
  }
  
  async deleteLink(linkId) {
    const link = await this.getLinkById(linkId);

    await this.linksRepository.softDelete({id: linkId});
    
    await this.postsService.incrementPostNextCount(link.sourcePostId, -1);
    await this.postsService.incrementPostPrevCount(link.targetPostId, -1);

    return this.linksRepository.findOne({id: linkId}, {
      withDeleted: true,
    })
  }

  incrementLinkVoteI(linkId: string) {
    this.linksRepository.increment({id: linkId}, 'voteI', 1);
  }
}
