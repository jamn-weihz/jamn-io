import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/user.model';

@ObjectType()
export class Col {
  @Field()
  id: string;
  
  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  i: number;

  @Field()
  pathname: string;

  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}