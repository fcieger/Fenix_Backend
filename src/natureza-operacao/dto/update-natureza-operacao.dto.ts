import { PartialType } from '@nestjs/mapped-types';
import { CreateNaturezaOperacaoDto } from './create-natureza-operacao.dto';

export class UpdateNaturezaOperacaoDto extends PartialType(
  CreateNaturezaOperacaoDto,
) {}
