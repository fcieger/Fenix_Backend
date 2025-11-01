import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitDbController } from './init-db.controller';

@Module({
  imports: [TypeOrmModule],
  controllers: [InitDbController],
})
export class InitDbModule {}

