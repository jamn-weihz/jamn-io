
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';

@ObjectType()
export class Lead {
  @Field()
  id: string;

  @Field()
  leaderUserId: string;

  @Field(() => User)
  leaderUser: User;

  @Field()
  followerUserId: string;

  @Field(() => User)
  followerUser: User;
  
  @Field()
  createDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}