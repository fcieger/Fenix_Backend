import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  context?: Array<{ role: string; content: string }>;

  @IsString()
  @IsOptional()
  companyId?: string;
}

export class ChatCompletionDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsOptional()
  temperature?: number;

  @IsOptional()
  maxTokens?: number;
}

