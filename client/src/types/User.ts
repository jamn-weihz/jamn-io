import { Post } from './Post';
import { Role } from './Role';

export type User = {
  id: string;
  focusId: string;
  focus: Post | null;
  roles: Role[];
  email: string | null;
  name: string;
  lowercarseName: string;
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