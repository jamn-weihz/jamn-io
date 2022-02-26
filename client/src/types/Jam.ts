import { Post } from './Post';
import { Role } from './Role';

export type Jam = {
  id: string;
  focusId: string;
  focus: Post;
  roles: Role[];
  name: string;
  description: string;
  color: string;
  lng: number;
  lat: number;
  isOpen: boolean;
  isPrivate: boolean;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
};