import { User } from './User';
import { Link } from './Link';
import { Jam } from './Jam';

export type Post = {
  id: string;
  userId: string;
  user: User;
  userI: number;
  jamId: string | null;
  jam: Jam | null;
  jamI: number;
  inLinks: Link[];
  outLinks: Link[];
  privacy: string;
  isOpaque: boolean | null;
  draft: string;
  name: string;
  description: string;
  saveDate: Date;
  commitDate: Date | null;
  prevCount: number;
  nextCount: number;
  startI: number | null;
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
  cardId: string;
}