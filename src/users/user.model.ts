import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/posts/post.model';
import { Role } from 'src/roles/role.model';
import { Sub } from 'src/subs/sub.model';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field({nullable: true})
  focusId: string;

  @Field(() => Post, {nullable: true})
  focus: Post;

  @Field(() => [Role])
  roles: Role[];

  @Field(() => [Sub])
  subs: Sub[];
  
  @Field(() => Int)
  postI: number;
  
  @Field(() => Int)
  voteI: number;
  
  @Field(() => Int)
  deletedVoteI: number;
  
  @Field()
  name: string;

  @Field()
  lowercaseName: string;

  @Field({ nullable: true })
  email: string;

  @Field()
  description: string;

  @Field()
  color: string;

  @Field({ nullable: true })
  lng: number;

  @Field({ nullable: true })
  lat: number;

  @Field({ nullable: true })
  zoom: number;

  @Field({ nullable: true })
  mapLng: number;

  @Field({ nullable: true })
  mapLat: number;

  @Field({ nullable: true })
  mapZoom: number;

  @Field()
  isRegisteredWithGoogle: boolean;
  
  @Field({ nullable: true })
  verifyEmailDate: Date;

  @Field()
  isAdmin: boolean;
  
  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({nullable: true})
  deleteDate: Date;
}