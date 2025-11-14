import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UploadDocumentoDto {
  @IsNotEmpty({ message: 'O ID da solicitação é obrigatório' })
  @IsUUID('4', { message: 'ID da solicitação inválido' })
  solicitacaoId: string;

  @IsNotEmpty({ message: 'O tipo de documento é obrigatório' })
  @IsString({ message: 'O tipo de documento deve ser um texto' })
  tipoDocumento: string;
}




