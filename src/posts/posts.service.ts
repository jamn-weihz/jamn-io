import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PRIVATE_POST_DRAFT, START_POST_DESC, START_POST_DRAFT, START_POST_I, START_POST_NAME } from 'src/constants';
import { In, Repository } from 'typeorm';
import { Post } from './post.entity';
import * as Enums from 'src/enums';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/users/users.service';
import { convertFromRaw } from 'draft-js';
import { JamsService } from 'src/jams/jams.service';
import { SearchService } from 'src/search/search.service';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
    private readonly searchService: SearchService,
    private readonly rolesService: RolesService,
  ) {}

  async indexPosts() {
    const posts = await this.postsRepository.find();
    this.searchService.savePosts(posts);
    return posts;
  }

  async getPostByIdWithPrivacy(userId: string, id: string) {
    const post = await this.postsRepository.findOne({ id });
    if (post.jamId && post.jamI !== 1) {
      const jam = await this.jamsService.getJamById(post.jamId);
      if (jam.isPrivate) {
        if (userId) {
          const role = await this.rolesService.getRoleByUserIdAndJamId(userId, post.jamId);
          if (!role || !role.isInvited || !role.isRequested) {
            post.name = '';
            post.description = '';
            post.draft = PRIVATE_POST_DRAFT;
            post.isOpaque = true;
          }
        }
        else {
          post.name = '';
          post.description = '';
          post.draft = PRIVATE_POST_DRAFT;
          post.isOpaque = true;
        }
      }
    }
    return post;
  }

  async getPostById(id: string) {
    return this.postsRepository.findOne({ id });
  }

  async getPostsByIdsWithPrivacy(userId: string, ids: string[]) {
    let roles = [];
    if (userId) {
      roles = await this.rolesService.getRolesByUserId(userId);
    }

    const posts = await this.postsRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['jam']
    });

    const posts1 = posts.map(post => {
      if (post.jam?.isPrivate && post.jamI !== 1) {
        const isMember = roles.some(role => {
          return role.jamId === post.jamId && role.isInvited && role.isRequested
        });
        if (isMember) {
          return post;
        }
        return {
          ...post,
          name: '',
          description: '',
          draft: PRIVATE_POST_DRAFT,
          isOpaque: true,
        };
      }
      return post;
    });

    return posts1;
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

  async getJamRecentPosts(userId: string, jamId: string, offset: number) {
    const jam = await this.jamsService.getJamById(jamId);
    if (!jam) {
      throw new BadRequestException('This jam does not exist');
    }
    let canView = true;
    if (jam.isPrivate && userId) {
      const roles = await this.rolesService.getRolesByUserId(userId);
      canView = roles.some(role => {
        return role.jamId === jamId;
      });
    }
    const posts = await this.postsRepository.createQueryBuilder('post')
      .select('post')
      .where('post.jamId = :jamId', {jamId})
      .orderBy('post.saveDate', 'DESC')
      .offset(offset)
      .limit(10)
      .getMany();

    if (canView) {
      return posts;
    }
    return posts.map(post => {
      if (post.jamI === 1) {
        return post;
      }
      return {
        ...post,
        name: '',
        description: '',
        draft: PRIVATE_POST_DRAFT,
      };
    })
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

  async createPost(userId: string, jamId: string | null, name: string, desc: string): Promise<Post> {
    const user = await this.usersService.getUserById(userId);
    await this.usersService.incrementUserPostI(userId);

    let jamI = null;
    if (jamId) {
      const jam = await this.jamsService.getJamById(jamId);
      await this.jamsService.incrementJamPostI(jamId);
      console.log('jam.postI', jam.postI);
      jamI = jam.postI + 1;
    }

    const blocks = [{
      key: uuidv4(),
      text: name,
      type: 'unstyled',
      depth: 0,
      entityRanges: [],
      inlinStyleRanges: [],
    }];
    if (desc) {
      blocks.push({
        key: uuidv4(),
        text: desc,
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
    post0.jamId = jamId || null;
    post0.jamI = jamI;
    post0.draft = draft;
    post0.name = name;
    post0.description = desc;
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

    if (post.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    };

    const contentState = convertFromRaw(JSON.parse(draft));
    const text = contentState.getPlainText('\n');
    const i = text.indexOf('\n');
    const name = i < 0
      ? text
      : text.slice(0, i);
    const description = i < 0
      ? ''
      : text.slice(i + 1);

    const post0 = new Post();
    post0.id = postId;
    post0.name = name;
    post0.description = description;
    post0.draft = draft;
    post0.saveDate = new Date();

    const post1 = await this.postsRepository.save(post0);
    this.searchService.partialUpdatePosts([post1]);
    return this.getPostById(post1.id);
  }

  incrementPostPrevCount(postId: string, value: number) {
    this.postsRepository.increment({id: postId}, 'prevCount', value);
  }

  incrementPostNextCount(postId: string, value: number) {
    this.postsRepository.increment({id: postId}, 'nextCount', value);
  }
}
