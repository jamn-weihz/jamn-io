import { User } from './User';
import { Link } from './Link';
import { Jam } from './Jam';

export type Post = {
  id: string;
  userId: string;
  user: User;
  jamId: string | null;
  jam: Jam | null;
  inLinks: Link[];
  outLinks: Link[];
  privacy: string;
  draft: string;
  name: string;
  description: string;
  saveDate: Date;
  commitDate: Date | null;
  prevCount: number;
  nextCount: number;
  clicks: number;
  tokens: number;
  weight: number;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}

export type PostState = {
  [postId: string]: string[];
}

export type PostAction = {
  type: string;
  postId: string;
  itemId: string;
}