import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { UsersModule } from 'src/users/users.module';
import { JamsModule } from 'src/jams/jams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => UsersModule),
    forwardRef(() => JamsModule),
  ],
  providers: [RolesService, RolesResolver],
  exports: [RolesService],
})
export class RolesModule {}
