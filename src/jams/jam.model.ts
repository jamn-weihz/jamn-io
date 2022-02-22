import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Post } from 'src/posts/post.model';
import { Role } from 'src/roles/role.model';

@ObjectType()
export class Jam {
  @Field()
  id: string;
  
  @Field({nullable: true})
  focusId: string;

  @Field(() => Post, {nullable: true})
  focus: Post;

  @Field(() => [Role])
  roles: Role[];

  @Field(() => Int)
  postI: number;

  @Field()
  name: string;

  @Field()
  lowercaseName: string;

  @Field()
  color: string;

  @Field(() => Float)
  lng: number;

  @Field(() => Float)
  lat: number;

  @Field()
  description: string;
  
  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}