import { Post } from "./Post";
import { User } from "./User";

export type Sub = {
  id: string;
  userId: string;
  user: User;
  postId: string;
  post: Post;
  createDate: Date;
  deleteDate: Date | null;
}