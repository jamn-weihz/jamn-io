import { User } from './User';

export type Lead = {
  id: string;
  leaderUserId: string;
  leaderUser: User;
  followerUserId: string;
  followerUser: User;
  createDate: Date;
  deleteDate: Date | null;
  __typename: string;
}