import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentosService } from './documentos.service';
import { UploadDocumentoDto } from './dto/upload-documento.dto';

@Controller('credito/documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const companyId = req['user']?.['companyId'] || 'temp';
          const uploadPath = `./uploads/credito/${companyId}`;
          
          // Criar diretório se não existir
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Aceitar apenas PDF, JPG, PNG
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Apenas arquivos PDF, JPG e PNG são permitidos'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return await this.documentosService.criar(
      req.user.companyId,
      uploadDto.solicitacaoId,
      uploadDto.tipoDocumento,
      file,
    );
  }

  @Get(':solicitacaoId')
  async listar(@Request() req, @Param('solicitacaoId') solicitacaoId: string) {
    return await this.documentosService.listar(req.user.companyId, solicitacaoId);
  }

  @Get(':id/download')
  async download(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const documento = await this.documentosService.buscar(id, req.user.companyId);
    
    if (!fs.existsSync(documento.caminhoArquivo)) {
      throw new BadRequestException('Arquivo não encontrado');
    }

    res.download(documento.caminhoArquivo, documento.nomeArquivo);
  }

  @Get(':id/view')
  async view(@Request() req, @Param('id') id: string) {
    const documento = await this.documentosService.buscar(id, req.user.companyId);
    
    // Gerar URL temporária (em produção, usar S3 pre-signed URL)
    const url = `/uploads/credito/${req.user.companyId}/${path.basename(documento.caminhoArquivo)}`;
    
    return { url };
  }

  @Delete(':id')
  async excluir(@Request() req, @Param('id') id: string) {
    await this.documentosService.excluir(id, req.user.companyId);
    return { success: true };
  }
}

