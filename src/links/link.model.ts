import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/posts/post.model';
import { Vote } from 'src/votes/vote.model';

@ObjectType()
export class Link {
  @Field()
  id: string;

  @Field()
  sourcePostId: string;

  @Field(() => Post)
  sourcePost: Post;

  @Field()
  targetPostId: string;
  
  @Field(() => Post)
  targetPost: Post;

  @Field(() => [Vote])
  votes: Vote[];

  @Field(() => Int)
  voteI: number;

  @Field(() => Int)
  clicks: number;

  @Field(() => Int)
  tokens: number;

  @Field(() => Int)
  weight: number;
  
  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}