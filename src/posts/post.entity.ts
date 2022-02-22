import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Jam } from 'src/jams/jam.entity';
import { Link } from 'src/links/link.entity';
import * as Enums from 'src/enums';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column()
  userI: number;

  @Column({ nullable: true })
  jamId: string;

  @ManyToOne(() => Jam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id' })
  jam: Jam;

  @Column({nullable: true})
  jamI: number;

  @OneToMany(() => Link, link => link.targetPost)
  inLinks: Link[];

  @OneToMany(() => Link, link => link.sourcePost)
  outLinks: Link[];

  @Column({
    type: 'enum',
    enum: Enums.PostPrivacy,
    default: Enums.PostPrivacy.ALL,
  })
  privacy: Enums.PostPrivacy;

  @Column({ nullable: true })
  startI: number; // non null if this is a Start Post 

  @Column({ default: ''})
  draft: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  description: string;

  @Column()
  saveDate: Date;
  
  @Column({ nullable: true })
  commitDate: Date;
  
  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: 0 })
  prevCount: number;

  @Column({ default: 0 })
  nextCount: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ default: 0 })
  weight: number;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn() 
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}