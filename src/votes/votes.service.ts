import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { JamsService } from 'src/jams/jams.service';
import { LeadsService } from 'src/leads/leads.service';
import { LinksService } from 'src/links/links.service';
import { PostsService } from 'src/posts/posts.service';
import { RolesService } from 'src/roles/roles.service';
import { SubsService } from 'src/subs/subs.service';
import { UsersService } from 'src/users/users.service';
import { findDefaultWeight } from 'src/utils';
import { Not, Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => JamsService))
    private readonly jamsService: JamsService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
    @Inject(forwardRef(() => LeadsService))
    private readonly leadsService: LeadsService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly subsService: SubsService,
    private readonly rolesService: RolesService,
    private readonly emailService: EmailService
  ) {}

  async getVotesByLinkId(linkId: string) {
    return this.votesRepository.find({
      where: {
        linkId,
      },
    });
  }

  async getVoteByUserIdAndLinkId(userId:string, linkId: string) {
    return this.votesRepository.findOne({
      where: {
        userId,
        linkId,
      }
    })
  }

  async getForeignVote(userId: string, linkId: string) {
    return this.votesRepository.findOne({
      where: {
        userId: Not(userId),
        linkId,
      }
    })
  }

  async getRecentUserVotes(userId: string, offset: number) {
    return this.votesRepository.createQueryBuilder('vote')
      .select('vote')
      .where('vote.userId = :userId', {userId})
      .andWhere('vote.deleteDate is null')
      .orderBy('vote.createDate', 'DESC')
      .offset(offset)
      .limit(10)
      .getMany();
  }
  
  async createVote(userId: string, linkId: string, sourcePostId: string, targetPostId: string, clicks: number, tokens: number): Promise<Vote> {
    const user = await this.usersService.getUserById(userId);
    this.usersService.incrementUserVoteI(userId);

    const link = await this.linksService.getLinkById(linkId);
    this.linksService.incrementLinkVoteI(linkId);

    const vote0 = new Vote();
    vote0.userId = userId;
    vote0.userI = user.voteI + 1;
    vote0.linkId = linkId;
    vote0.linkI = link.voteI + 1;
    vote0.sourcePostId = sourcePostId;
    vote0.targetPostId = targetPostId;
    vote0.clicks = clicks;
    vote0.tokens = tokens;
    vote0.weight = findDefaultWeight(clicks, tokens);
    const vote = await this.votesRepository.save(vote0);
    this.notify(vote);
    return vote;
  }

  async deleteVote(voteId: string) {
    const vote0 = new Vote();
    vote0.id = voteId;
    vote0.deleteDate = new Date();
    return this.votesRepository.save(vote0);
  }

  async notify(vote: Vote) {
    const leads = await this.leadsService.getLeadsByLeaderUserId(vote.userId);
    const sourcePostSubs = await this.subsService.getSubsByPostId(vote.sourcePostId);
    const targetPostSubs = await this.subsService.getSubsByPostId(vote.targetPostId);

    const userIdToReasons: any = {};
    leads.forEach(lead => {
      userIdToReasons[lead.followerUserId] = {
        lead,
      };
    });
    sourcePostSubs.forEach(sub => {
      if (userIdToReasons[sub.userId]) {
        userIdToReasons[sub.userId].sourcePostSub = sub;
      }
      else {
        userIdToReasons[sub.userId] = {
          sourcePostSub: sub,
        };
      }
    });
    targetPostSubs.forEach(sub => {
      if (userIdToReasons[sub.userId]) {
        userIdToReasons[sub.userId].targetPostSub = sub;
      }
      else {
        userIdToReasons[sub.userId] = {
          targetPostSub: sub
        };
      }
    });

    const user = await this.usersService.getUserById(vote.userId);
    const sourcePost = await this.postsService.getPostById(vote.sourcePostId);
    const sourcePostJam = sourcePost?.jamId
      ? await this.jamsService.getJamById(sourcePost.jamId)
      : null;
    const sourcePostRoles = sourcePostJam?.isPrivate
      ? await this.rolesService.getRolesByJamId(sourcePostJam.id)
      : [];
    const targetPost = await this.postsService.getPostById(vote.targetPostId);
    const targetPostJam = targetPost?.jamId
      ? await this.jamsService.getJamById(targetPost.jamId)
      : null;
    const targetPostRoles = targetPostJam?.isPrivate
      ? await this.rolesService.getRolesByJamId(targetPostJam.id)
      : [];

    const users = await this.usersService.getUsersByIds(Object.keys(userIdToReasons));
    const idToUser: any = {};
    users.forEach(user => {
      idToUser[user.id] = user;
    })

    Object.keys(userIdToReasons).forEach(userId => {
      let sourcePostName = sourcePostJam?.isPrivate
        ? sourcePostRoles.some(role => role.userId === userId && role.isInvited && role.isRequested)
          ? sourcePost.name
          : '<private>'
        : sourcePost.name
      if (!sourcePostName.length) {
        sourcePostName = '...'
      }
      let targetPostName = targetPostJam?.isPrivate
        ? targetPostRoles.some(role => role.userId === userId && role.isInvited && role.isRequested)
          ? targetPost.name
          : '<private>'
        : targetPost.name;
      if (!targetPostName.length) {
        targetPostName = '...'
      }
        
      const subject = userIdToReasons[userId].lead
        ? `New vote by u/${user.name}`
        : userIdToReasons[userId].sourcePostSub && userIdToReasons[userId].targetPostSub
          ? `New vote between posts "${sourcePostName}" and "${targetPostName}"`
          : userIdToReasons[userId].sourcePostSub
            ? `New vote on post "${sourcePostName}"`
            : userIdToReasons.targetPostSub
              ? `New vote on post "${targetPostName}"`
              : `New vote by u/${user.name}`;
    
      let text = `u/${user.name}\nhttps://jamn.io/u/${encodeURIComponent(user.name)}`;
      if (userIdToReasons[userId].lead) {
        text += '\n(whom you follow)'
      }
      if (vote.linkI === 1) {
        text += '\n\ncreated a new link from'
      }
      else {
        text += '\n\nvoted on a link from'
      }
      text += `\n\n"${sourcePostName}"\nhttps://jamn.io/p/${sourcePost.id}`;
      if (userIdToReasons[userId].sourcePostSub) {
        text += '\n(to which you are subscribed)'
      }
      text += `\n\nto\n`;
      text += `\n"${targetPostName}"\nhttps://jamn.io/p/${targetPost.id}`;
      if (userIdToReasons[userId].targetPostSub) {
        text += '\n(to which you have subscribed)'
      }
      text += `\n\nGo check it out!`;

      this.emailService.sendMail({
        from: 'JAMN <notifications@jamn.io>',
        to: idToUser[userId].email,
        subject,
        text,
      });
    })
  }
}
