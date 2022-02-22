import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Jam } from 'src/jams/jam.entity';
import * as Enums from 'src/enums';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column()
  jamId: string;

  @ManyToOne(() => Jam)
  @JoinColumn({ referencedColumnName: 'id' })
  jam: Jam;
  
  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.VIEWER,
  })
  type: Enums.RoleType;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}