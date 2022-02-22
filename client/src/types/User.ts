import { Col } from './Col';
import { Post } from './Post';
import { Role } from './Role';

export type User = {
  id: string;
  cols: Col[];
  focusId: string;
  focus: Post | null;
  roles: Role[];
  email: string | null;
  name: string;
  lowercaseName: string;
  description: string;
  color: string;
  lng: number | null;
  lat: number | null;
  mapLng: number | null;
  mapLat: number | null;
  mapZoom: number | null;
  verifyEmailDate: Date;
  isRegisteredWithGoogle: boolean;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}