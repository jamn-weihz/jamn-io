import { Col } from './Col';
import { Lead } from './Lead';
import { Post } from './Post';
import { Role } from './Role';
import { Sub } from './Sub';

export type User = {
  id: string;
  cols: Col[];
  focusId: string;
  focus: Post;
  roles: Role[];
  subs: Sub[];
  leaders: Lead[];
  followers: Lead[];
  email: string;
  name: string;
  lowercaseName: string;
  description: string;
  color: string;
  lng: number | null;
  lat: number | null;
  mapLng: number | null;
  mapLat: number | null;
  mapZoom: number | null;
  postI: number;
  voteI: number;
  verifyEmailDate: Date;
  isRegisteredWithGoogle: boolean;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}

export type UserState = {
  [id: string]: boolean;
}

export type AddUserAction = {
  type: 'ADD_USER',
  userId: string;
}
export type RefreshUserAction = {
  type: 'REFRESH_USER',
  userId: string;
}
export type RefreshCompleteAction = {
  type: 'REFRESH_COMPLETE',
  userId: string;
}

export type UserAction = 
  AddUserAction |
  RefreshUserAction |
  RefreshCompleteAction;