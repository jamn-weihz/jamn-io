import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Jam } from './jam.entity';
import * as Enums from 'src/enums';
import { PostsService } from 'src/posts/posts.service';
import { LinksService } from 'src/links/links.service';
import { VotesService } from 'src/votes/votes.service';

@Injectable()
export class JamsService {
  constructor(
    @InjectRepository(Jam)
    private readonly jamsRepository: Repository<Jam>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
    @Inject(forwardRef(() => VotesService))
    private readonly votesService: VotesService,
  ) {}

  async getJamById(id: string): Promise<Jam> {
    return this.jamsRepository.findOne({id});
  }

  async getJamByName(name: string): Promise<Jam> {
    const lowercaseName = name.trim().toLowerCase();
    return this.jamsRepository.findOne({
      where: {
        lowercaseName,
      },
    });
  }

  async getJamsByLocation(lng: number, lat: number, zoom: number): Promise<Jam[]> {
    return this.jamsRepository.createQueryBuilder('jam')
      .select([
        'jam.id as id',
        'jam.name as name',
        'jam.lng as lng',
        'jam.lat as lat',
      ])
      .getRawMany();
  }

  async startJam(userId: string, lng: number, lat: number, name: string, description: string): Promise<Jam> {
    const jam = await this.getJamByName(name);
    if (jam) {
      throw new BadRequestException('This name is already in use');
    }
    const user = await this.usersService.getUserById(userId);

    const jam0 = new Jam();
    jam0.name = name.trim();
    jam0.description = description;
    jam0.lowercaseName = jam0.name.toLowerCase();
    jam0.color = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0')
    jam0.lng = lng;
    jam0.lat = lat;
    jam0.location = {
      type: 'Point',
      coordinates: [lng, lat],
    };
    jam0.postI = 0;
    const jam1 = await this.jamsRepository.save(jam0);

    const role = await this.rolesService.createRole(user.id, jam1.id, Enums.RoleType.ADMIN);

    let startPost = await this.postsService.getStartPost();
    if (!startPost) {
      startPost = await this.postsService.createStartPost(user.id);
    }
    this.postsService.incrementPostNextCount(startPost.id, 1);
    
    const jamPost = await this.postsService.createPost(user.id, jam1.id, jam1.name, jam1.description);

    const link = await this.linksService.createLink(startPost.id, jamPost.id, 1, 0);
    const vote = await this.votesService.createVote(userId, link.id, startPost.id, jamPost.id, 1, 0);

    jam1.focusId = jamPost.id;
    const jam2 = await this.jamsRepository.save(jam1);
    return jam2;
  }

  async setJamColor(userId: string, jamId: string, color: string) {
    const jam = await this.getJamById(jamId);
    if (!jam) {
      throw new BadRequestException('This jam does not exist');
    }
    const role = await this.rolesService.getRoleByUserIdAndJamId(userId, jamId);
    if (role.type !== Enums.RoleType.ADMIN) {
      throw new BadRequestException('Insufficient privileges');
    };
    const jam0 = new Jam();
    jam0.id = jamId;
    jam0.color = color;
    await this.jamsRepository.save(jam0);
    return this.getJamById(jamId);
  }

  async setJamIsClosed(userId: string, jamId: string, isClosed: boolean) {
    const jam = await this.getJamById(jamId);
    if (!jam) {
      throw new BadRequestException('This jam does not exist');
    }
    const role = await this.rolesService.getRoleByUserIdAndJamId(userId, jamId);
    if (role.type !== Enums.RoleType.ADMIN) {
      throw new BadRequestException('Insufficient privileges');
    };
    const jam0 = new Jam();
    jam0.id = jamId;
    jam0.isClosed = isClosed;
    await this.jamsRepository.save(jam0);
    return this.getJamById(jamId);
  }

  async setJamIsPrivate(userId: string, jamId: string, isPrivate: boolean) {
    const jam = await this.getJamById(jamId);
    if (!jam) {
      throw new BadRequestException('This jam does not exist');
    }
    const role = await this.rolesService.getRoleByUserIdAndJamId(userId, jamId);
    if (role.type !== Enums.RoleType.ADMIN) {
      throw new BadRequestException('Insufficient privileges');
    };
    const jam0 = new Jam();
    jam0.id = jamId;
    jam0.isPrivate = isPrivate;
    await this.jamsRepository.save(jam0);
    return this.getJamById(jamId);
  }

  incrementJamPostI(jamId: string) {
    this.jamsRepository.increment({id: jamId}, 'postI', 1);
  }
}
