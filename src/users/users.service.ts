import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { adjectives, animals, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { PostsService } from 'src/posts/posts.service';
import { LinksService } from 'src/links/links.service';
import { VotesService } from 'src/votes/votes.service';
import { SubsService } from 'src/subs/subs.service';

const numbers = NumberDictionary.generate({ min: 100, max: 999 });

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
    @Inject(forwardRef(() => VotesService))
    private readonly votesService: VotesService,
    private readonly subsService: SubsService,
  ) {}

  async getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ id });
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email: email.trim().toLocaleLowerCase(),
      },
    });
  }

  async getUserByName(name: string): Promise<User> {
    const lowercaseName = name.trim().toLowerCase();
    return this.usersRepository.findOne({
      where: {
        lowercaseName,
      },
    });
  }

  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user || !user.hashedRefreshToken || !refreshToken) return null;
    const isMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatching) return null;
    return user;
  }

  async registerUser(email: string, pass: string | null, isGoogle: boolean): Promise<User> {
    const user = await this.getUserByEmail(email);
    if (user) {
      throw new BadRequestException('Email is already in use');
    }
    let name = '';
    let existingUser = null;

    do {
      name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals, numbers],
        length: 3,
        separator: '-'
      });
      existingUser = await this.usersRepository.findOne({
        where: {
          name,
        },
      })
    } while (existingUser);

    const hash = pass
      ? await bcrypt.hash(pass, 10)
      : null;
    const user0 = new User();
    user0.name = name;
    user0.lowercaseName = name;
    user0.email = email.trim().toLowerCase();
    user0.color = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0')
    user0.hashedPassword = hash;
    user0.isRegisteredWithGoogle = isGoogle;
    user0.verifyEmailDate = isGoogle ? new Date() : null;
    user0.postI = 0;
    user0.voteI = 0;
    const user1 = await this.usersRepository.save(user0);

    let startPost = await this.postsService.getStartPost();
    if (!startPost) {
      startPost = await this.postsService.createStartPost(user1.id);
    }
    await this.postsService.incrementPostNextCount(startPost.id, 1);
    await this.postsService.incrementPostsWeights([startPost.id], 1, 0, 1);
    const userPost = await this.postsService.createPost(user1.id, null, '', '');

    const link = await this.linksService.createLink(startPost.id, userPost.id, 1, 0);
    const vote = await this.votesService.createVote(user1.id, link.id, startPost.id, userPost.id, 1, 0);

    const sub = await this.subsService.subPost(user1.id, userPost.id);
    user1.focusId = userPost.id;
    user1.postI = undefined;

    await this.usersRepository.save(user1);
    return this.getUserById(user1.id);
  }

  async verifyUser(userId: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.verifyEmailDate = new Date();
    user0.hashedEmailVerificationCode = null;
    return this.usersRepository.save(user0);
  }

  async setEmailVerificationCode(userId: string, code: string): Promise<User> {
    const hashedEmailVerificationCode = await bcrypt.hash(code, 10);
    const user0 = new User();
    user0.id = userId;
    user0.hashedEmailVerificationCode = hashedEmailVerificationCode;
    return this.usersRepository.save(user0);
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<User> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const user0 = new User();
    user0.id = userId;
    user0.hashedRefreshToken = hashedRefreshToken;
    return this.usersRepository.save(user0);
  }

  async removeRefreshToken(userId: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.hashedRefreshToken = null;
    return this.usersRepository.save(user0);
  }

  async updateUserMap(userId: string, lng: number, lat: number, zoom: number) {
    const user0 = new User();
    user0.id = userId;
    user0.mapLng = lng;
    user0.mapLat = lat;
    user0.mapZoom = zoom;
    return this.usersRepository.save(user0);
  }

  async incrementUserPostI(userId: string) {
    await this.usersRepository.increment({id: userId}, 'postI', 1);
  }

  async incrementUserVoteI(userId: string) {
    await this.usersRepository.increment({id: userId}, 'voteI', 1);
  }

  async incrementUserDeleteVoteI(userId: string) {
    await this.usersRepository.increment({id: userId}, 'deletedVoteI', 1);
  }

  async setUserColor(userId: string, color: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.color = color;
    return this.usersRepository.save(user0);
  }

  async setUserName(userId: string, name: string): Promise<User> {
    const user = await this.getUserByName(name);
    if (user && user.id !== userId) {
      return null;
    }
    const user0 = new User();
    user0.id = userId;
    user0.name = name.trim();
    user0.lowercaseName = user0.name.toLowerCase();
    return this.usersRepository.save(user0);
  }
  
}
