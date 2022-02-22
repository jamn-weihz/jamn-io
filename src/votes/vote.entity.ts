
import { 
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Post } from 'src/posts/post.entity';
import { Link } from 'src/links/link.entity';

@Entity()
export class Vote {
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

  @Column()
  linkId: string;

  @ManyToOne(() => Link)
  @JoinColumn({ referencedColumnName: 'id' })
  link: Link;
  
  @Column()
  userId: string;
  
  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;
  
  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ default: 0 })
  weight: number;
  
  @CreateDateColumn()
  createDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}