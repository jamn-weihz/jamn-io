import { 
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Point } from 'geojson';
import { Exclude } from 'class-transformer';
import { Role } from 'src/roles/role.entity';
import { Post } from 'src/posts/post.entity';
import { Sub } from 'src/subs/sub.entity';
import { Lead } from 'src/leads/lead.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  focusId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  focus: Post;

  @OneToMany(() => Role, role => role.user)
  roles: Role[];

  @OneToMany(() => Sub, sub => sub.user)
  subs: Sub[];

  @OneToMany(() => Lead, lead => lead.followerUser)
  leaders: Lead[];

  @OneToMany(() => Lead, lead => lead.leaderUser)
  followers: Lead[];

  @Column({default: 0})
  postI: number;

  @Column({default: 0})
  voteI: number;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true })
  lowercaseName: string;

  @Column()
  @Index({ unique: true })
  email: string;
  
  @Column({ default: '' })
  description: string;

  @Column()
  color: string;
  
  @Column('double precision', { nullable: true })
  lng: number;

  @Column('double precision', { nullable: true })
  lat: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: Point;

  @Column('double precision', { nullable: true })
  mapLng: number;

  @Column('double precision', { nullable: true })
  mapLat: number;

  @Column('double precision', {nullable: true})
  mapZoom: number;

  @Column({ default: false })
  isRegisteredWithGoogle: boolean;

  @Exclude()
  @Column({ nullable: true })
  hashedPassword: string;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Exclude()
  @Column({ nullable: true })
  hashedEmailVerificationCode: string;

  @Column({ nullable: true })
  verifyEmailDate: Date;

  @Column({default: false})
  isAdmin: boolean;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
 
  @DeleteDateColumn()
  deleteDate: Date;
}