import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Point } from 'geojson';
import { Role } from 'src/roles/role.entity';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Jam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  focusId: string;
  
  @ManyToOne(() => Post, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id'})
  focus: Post;

  @OneToMany(() => Role, role => role.jam)
  roles: Role[];

  @Column({ default: 0})
  postI: number;
  
  @Column()
  name: string;
  
  @Column()
  @Index({unique: true })
  lowercaseName: string;
  
  @Column({ default: '' })
  description: string;
  
  @Column()
  color: string;

  @Column('double precision')
  lng: number;

  @Column('double precision')
  lat: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({default: false})
  isClosed: boolean;

  @Column({default: false})
  isPrivate: boolean;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}