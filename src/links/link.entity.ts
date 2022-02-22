import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Post } from 'src/posts/post.entity';
import { Vote } from 'src/votes/vote.entity';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourcePostId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'sourcePostId', referencedColumnName: 'id' })
  sourcePost: Post;

  @Column()
  targetPostId: string;
  
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'targetPostId', referencedColumnName: 'id' })
  targetPost: Post;

  @OneToMany(() => Vote, vote => vote.link)
  votes: Vote[];

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