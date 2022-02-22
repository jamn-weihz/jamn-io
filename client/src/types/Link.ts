import { Post } from './Post';
import { Vote } from './Vote';

export type Link = {
  id: string;
  sourcePostId: string;
  sourcePost: Post;
  targetPostId: string;
  targetPost: Post;
  votes: Vote[];
  clicks: number;
  tokens: number;
  weight: number;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}