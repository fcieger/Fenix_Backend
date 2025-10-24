import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserAccessLogsModule } from '../user-access-logs/user-access-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserAccessLogsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
