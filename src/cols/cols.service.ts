import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Col } from './col.entity';

@Injectable()
export class ColsService {
  constructor(
    @InjectRepository(Col)
    private readonly colsRepository: Repository<Col>,
  ) {}

  async getColById(id: string): Promise<Col> {
    return this.colsRepository.findOne({ id });
  }

  async getColsById(ids: string[]): Promise<Col[]> {
    return this.colsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
  
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
    if (!col) {
      throw new BadRequestException('This col does not exist')
    };
    const col0 = new Col();
    col0.id = colId;
    col0.pathname = pathname
    await this.colsRepository.save(col0);
    return this.getColById(colId);
  }

  async shiftCol(userId: string, colId: string, di: number): Promise<Col[]> {
    if (di !== -1 && di !== 1) return [];

    const cols = await this.colsRepository.find({
      where: {
        userId,
      },
    });

    cols.sort((a, b) => a.i < b.i ? -1 : 1)

    let col;
    cols.some(col_i => {
      if (col_i.id === colId) {
        col = col_i;
        return true;
      }
      return false;
    });
    if (!col || !cols[col.i + di] ) return [];

    const col0 = new Col();
    col0.id = colId;
    col0.i = col.i + di;
    
    const targetCol0 = new Col();
    targetCol0.id = cols[col.i + di].id;
    targetCol0.i = col.i;
    
    const cols1 = await this.colsRepository.save([col0, targetCol0]);
    return this.getColsById(cols1.map(col => col.id));
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
