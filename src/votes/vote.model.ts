import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Post } from 'src/posts/post.model';
import { Link } from 'src/links/link.model';

@ObjectType()
export class Vote {
  @Field()
  id: string;
  
  @Field()
  userId: string;
  
  @Field(() => User)
  user: User;

  @Field(() => Int)
  userI: number;
  
  @Field()
  linkId: string;

  @Field(() => Link)
  link: Link;

  @Field()
  linkI: number;

  @Field()
  sourcePostId: string;

  @Field(() => Post)
  sourcePost: Post;

  @Field()
  targetPostId: string;

  @Field(() => Post)
  targetPost: Post;

  @Field(() => Int)
  clicks: number;

  @Field(() => Int)
  tokens: number;

  @Field(() => Int)
  weight: number;
  
  @Field()
  createDate: Date;

  @Field({nullable: true})
  deleteDate: Date;
}