import { Module } from '@nestjs/common';
import { ColsService } from './cols.service';
import { ColsResolver } from './cols.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Col } from './col.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Col]),
  ],
  providers: [ColsService, ColsResolver],
  exports: [ColsService],
})
export class ColsModule {}
