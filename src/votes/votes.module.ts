import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from 'src/links/links.module';
import { UsersModule } from 'src/users/users.module';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesResolver } from './votes.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { SubsModule } from 'src/subs/subs.module';
import { LeadsModule } from 'src/leads/leads.module';
import { JamsModule } from 'src/jams/jams.module';
import { RolesModule } from 'src/roles/roles.module';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => JamsModule),
    forwardRef(() => LinksModule),
    forwardRef(() => PostsModule),
    forwardRef(() => SubsModule),
    forwardRef(() => RolesModule),
    LeadsModule,
    PubSubModule,
    EmailModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
