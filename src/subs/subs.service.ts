import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { Repository } from 'typeorm';
import { Sub } from './sub.entity';

@Injectable()
export class SubsService {
  constructor(
    @InjectRepository(Sub)
    private readonly subsRepository: Repository<Sub>,
    private readonly postsService: PostsService,
  ) {}

  async getSubById(id: string) {
    return this.subsRepository.findOne({id});
  }

  async getSubsByUserId(userId: string) {
    return this.subsRepository.find({
      where: {
        userId,
      },
    });
  }

  async getSubsByPostId(postId: string) {
    return this.subsRepository.find({
      where: {
        postId,
      },
    });
  }

  async getSubByUserIdAndPostId(userId: string, postId: string) {
    return this.subsRepository.findOne({
      where: {
        userId,
        postId,
      },
    });
  }


  async subPost(userId: string, postId: string): Promise<Sub> {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new BadRequestException('This post does not exist');
    }
    const sub0 = new Sub();
    sub0.userId = userId;
    sub0.postId = postId;
    return this.subsRepository.save(sub0);
  }

  async unsubPost(userId: string, postId: string): Promise<Sub> {
    const sub = await this.getSubByUserIdAndPostId(userId, postId);
    if (!sub) {
      throw new BadRequestException('This sub does not exist');
    }
    await this.subsRepository.softDelete({id: sub.id});

    return this.subsRepository.findOne({
      where: {
        id: sub.id,
      },
      withDeleted: true,
    });
  }
}
