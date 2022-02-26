import { User } from './User';
import { Jam } from './Jam';

export type Role = {
  id: string;
  userId: string;
  user: User;
  jamId: string;
  jam: Jam;
  type: string;
  isInvited: boolean;
  isRequested: boolean;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}