import { ObjectType, Field, Int } from "@nestjs/graphql";
import { User } from 'src/users/user.model';
import { Jam } from 'src/jams/jam.model';
import { Link } from 'src/links/link.model';

@ObjectType()
export class Post {
  @Field()
  id: string;
  
  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  userI: number;

  @Field({ nullable: true })
  jamId: string;
  
  @Field(() => Jam)
  jam: Jam;

  @Field(() => Int, {nullable: true}) 
  jamI: number;

  @Field(() => [Link])
  inLinks: Link[];

  @Field(() => [Link])
  outLinks: Link[];

  @Field()
  privacy: string;
  
  @Field()
  draft: string;

  @Field()
  name: string;
  
  @Field()
  description: string;

  @Field()
  saveDate: Date;

  @Field({ nullable: true })
  isOpaque: boolean;
  
  @Field({ nullable: true })
  commitDate: Date;

  @Field(() => Int)
  prevCount: number;

  @Field(() => Int)
  nextCount: number;

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