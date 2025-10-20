import { PartialType } from '@nestjs/mapped-types';
import { CreatePrazoPagamentoDto } from './create-prazo-pagamento.dto';

export class UpdatePrazoPagamentoDto extends PartialType(CreatePrazoPagamentoDto) {}


