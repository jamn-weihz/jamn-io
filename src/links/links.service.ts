import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { findDefaultWeight } from 'src/utils';
import { Repository } from 'typeorm';
import { Link } from './link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>
  ) {}

  async createLink(sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Link> {
    const link0 = new Link();
    link0.sourcePostId = sourcePostId;
    link0.targetPostId = targetPostId;
    link0.clicks = clicks;
    link0.tokens = tokens;
    link0.weight = findDefaultWeight(link0.clicks, link0.tokens);
    return this.linksRepository.save(link0);
  }
}
