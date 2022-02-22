
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Jam } from 'src/jams/jam.model';

@ObjectType()
export class Role {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  jamId: string;

  @Field(() => Jam)
  jam: Jam;
  
  @Field()
  type: string;

  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}