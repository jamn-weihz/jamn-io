import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { adjectives, animals, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const numbers = NumberDictionary.generate({ min: 100, max: 999 });

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ id });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email,
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
    if (!user) return null;
    const isMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatching) return null;
    return user;
  }

  async registerUser(email: string, pass: string | null, isGoogle: boolean): Promise<User> {
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
    user0.email = email;
    user0.color = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0')
    user0.hashedPassword = hash;
    user0.isRegisteredWithGoogle = isGoogle;
    user0.verifyEmailDate = isGoogle ? new Date() : null;
    user0.postI = 0;
    const user1 = this.usersRepository.save(user0);

    return user1;
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

  incrementUserPostI(userId: string) {
    this.usersRepository.increment({id: userId}, 'postI', 1);
  }

  async setUserColor(userId: string, color: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.color = color;
    return this.usersRepository.save(user0);
  }
  
}
