import { Post } from './Post';
import { Link } from './Link';
import { User } from './User';

export type Vote = {
    id: string;
    userId: string;
    user: User;
    linkId: string;
    link: Link;
    sourcePostId: string;
    sourcePost: Post;
    targetPostId: string;
    targetPost: Post;
    clicks: number;
    tokens: number;
    weight: number;
    createDate: Date;
    deleteDate: Date | null;
    __typename: string;
  }