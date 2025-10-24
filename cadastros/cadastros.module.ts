import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadastrosService } from './cadastros.service';
import { CadastrosController } from './cadastros.controller';
import { Cadastro } from './entities/cadastro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cadastro])],
  controllers: [CadastrosController],
  providers: [CadastrosService],
  exports: [CadastrosService],
})
export class CadastrosModule {}
