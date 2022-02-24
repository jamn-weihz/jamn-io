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
      col0.pathname = pathname === '/register' || pathname === '/login'
        ? `/u/${userName}` 
        : pathname;
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

  async saveCol(userId: string, colId: string, pathname: string): Promise<Col> {
    const col = await this.colsRepository.findOne({
      where: {
        id: colId,
        userId,
      }
    });
    if (!col) return null;
    const col0 = new Col();
    col0.id = colId;
    col0.pathname = pathname
    return this.colsRepository.save(col0);
  }

  async removeCol(userId: string, colId: string): Promise<Col[]> {
    const col = await this.colsRepository.findOne({
      where: {
        id: colId,
        userId,
      }
    });
    if (!col) return [];

    const cols = await this.getColsByUserId(userId);

    const cols0 = [];
    cols.forEach(col_i => {
      if (col_i.id === colId) {
        const col0 = new Col();
        col0.id = colId;
        col0.i = col_i.i;
        col0.deleteDate = new Date();
        cols0.push(col0);
      }
      else if (col_i.i > col.i) {
        const col0 = new Col();
        col0.id = col_i.id;
        col0.i = col_i.i - 1;
        cols0.push(col0);
      }
    });

    console.log(cols0);

    return this.colsRepository.save(cols0);
  }
}
