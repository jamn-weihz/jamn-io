import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Col } from './col.entity';

@Injectable()
export class ColsService {
  constructor(
    @InjectRepository(Col)
    private readonly colsRepository: Repository<Col>,
  ) {}

  async getColsByUserId(userId: string):Promise<Col[]> {
    return this.colsRepository.find({
      where: {
        userId,
      },
    });
  }
  
  async registerCols(userId: string, userName: string, pathnames: string[]): Promise<Col[]> {
    const cols0 = pathnames.map((pathname, i) => {
      const col0 = new Col();
      col0.userId = userId;
      col0.i = i;
      col0.pathname = pathname
      return col0;
    })

    return this.colsRepository.save(cols0);
  }

  async addCol(userId: string, pathname: string): Promise<Col> {
    const cols = await this.getColsByUserId(userId);
    const col0 = new Col();
    col0.userId = userId;
    col0.i = cols.length;
    col0.pathname = pathname;
    return this.colsRepository.save(col0);
  }
}
