import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leaderUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  leaderUser: User;

  @Column()
  followerUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  followerUser: User;

  @CreateDateColumn()
  createDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}