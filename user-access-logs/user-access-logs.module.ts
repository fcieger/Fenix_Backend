import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccessLog } from './entities/user-access-log.entity';
import { UserAccessLogsService } from './user-access-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccessLog])],
  providers: [UserAccessLogsService],
  exports: [UserAccessLogsService],
})
export class UserAccessLogsModule {}
