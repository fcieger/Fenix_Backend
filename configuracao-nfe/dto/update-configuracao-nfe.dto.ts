import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracaoNfeDto } from './create-configuracao-nfe.dto';

export class UpdateConfiguracaoNfeDto extends PartialType(CreateConfiguracaoNfeDto) {}



