import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from 'src/links/links.module';
import { UsersModule } from 'src/users/users.module';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => LinksModule),
  ],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
