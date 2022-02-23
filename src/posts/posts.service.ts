import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { START_POST_DESC, START_POST_DRAFT, START_POST_I, START_POST_NAME } from 'src/constants';
import { In, Repository } from 'typeorm';
import { Post } from './post.entity';
import * as Enums from 'src/enums';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/users/users.service';
import { convertFromRaw } from 'draft-js';
import { JamsService } from 'src/jams/jams.service';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
    private readonly searchService: SearchService,
  ) {}

  async getPostById(id: string) {
    return this.postsRepository.findOne({ id });
  }

  async getPostsByIds(ids: string[]) {
    return this.postsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async getStartPost() {
    return this.postsRepository.findOne({
      where: {
        startI: START_POST_I,
      }
    });
  }

  async createStartPost(userId: string) {
    const user = await this.usersService.getUserById(userId);
    this.usersService.incrementUserPostI(userId);

    const post0 = new Post();
    post0.userId = userId;
    post0.draft = START_POST_DRAFT;
    post0.name = START_POST_NAME;
    post0.description = START_POST_DESC;
    post0.privacy = Enums.PostPrivacy.ALL;
    post0.saveDate = new Date();
    post0.startI = 1;
    post0.userI = user.postI + 1;

    const post1 = await this.postsRepository.save(post0);
    this.searchService.savePosts([post1]);
    return post1;
  }

  async createJamPost(userId: string, jamId: string, jamName: string, jamDesc: string) {
    const user = await this.usersService.getUserById(userId);
    this.usersService.incrementUserPostI(userId);

    const blocks = [{
      key: uuidv4(),
      text: jamName,
      type: 'unstyled',
      depth: 0,
      entityRanges: [],
      inlinStyleRanges: [],
    }];
    if (jamDesc) {
      blocks.push({
        key: uuidv4(),
        text: jamDesc,
        type: 'unstyled',
        depth: 0,
        entityRanges: [],
        inlinStyleRanges: [],
      });
    }
    const draft = JSON.stringify({
      blocks,
      entityMap: {}
    });
    
    const post0 = new Post();
    post0.userId = userId;
    post0.userI = user.postI + 1;
    post0.jamId = jamId;
    post0.jamI = 1;
    post0.draft = draft;
    post0.name = jamName;
    post0.description = jamDesc;
    post0.privacy = Enums.PostPrivacy.ALL;
    post0.prevCount = 1;
    post0.nextCount = 0;
    post0.saveDate = new Date();

    const post1 = await this.postsRepository.save(post0);
    this.searchService.savePosts([post1]);
    return post1;
  }

  async createPost(userId: string, jamId?: string): Promise<Post> {
    const user = await this.usersService.getUserById(userId);
    this.usersService.incrementUserPostI(userId);

    let jamI = null;
    if (jamId) {
      const jam = await this.jamsService.getJamById(jamId);
      this.jamsService.incrementJamPostI(jamId);
      jamI = jam.postI;
    }

    const post0 = new Post();
    post0.userId = userId;
    post0.userI = user.postI + 1;
    post0.jamId = jamId;
    post0.jamI = jamI;
    post0.draft = '';
    post0.name = '';
    post0.description = '';
    post0.prevCount = 1;
    post0.nextCount = 0;
    post0.saveDate = new Date();
    post0.commitDate = null;
    const post1 = await this.postsRepository.save(post0);
    this.searchService.savePosts([post1]);
    return post1;
  }

  async savePost(userId: string, postId: string, draft: string): Promise<Post> {
    const post = await this.postsRepository.findOne({id: postId});

    if (post.userId !== userId) return null;

    const contentState = convertFromRaw(JSON.parse(draft));
    const text = contentState.getPlainText('\n');
    const i = text.indexOf('\n');
    const name = i < 0
      ? text
      : text.slice(0, 1);
    const description = i < 0
      ? ''
      : text.slice(i + 1);

    const post0 = new Post();
    post0.id = postId;
    post0.name = name;
    post0.description = description;
    post0.draft = draft;
    post0.saveDate = new Date();

    return this.postsRepository.save(post0);
  }

  incrementPostPrevCount(postId: string) {
    this.postsRepository.increment({id: postId}, 'prevCount', 1);
  }

  incrementPostNextCount(postId: string) {
    this.postsRepository.increment({id: postId}, 'nextCount', 1);
  }
}
