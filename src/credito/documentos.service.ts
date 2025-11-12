import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DocumentoCredito } from './entities/documento-credito.entity';
import { SolicitacaoCredito } from './entities/solicitacao-credito.entity';
import * as fs from 'fs';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentoCredito)
    private documentoRepository: Repository<DocumentoCredito>,
    @InjectRepository(SolicitacaoCredito)
    private solicitacaoRepository: Repository<SolicitacaoCredito>,
  ) {}

  async criar(
    empresaId: string,
    solicitacaoId: string,
    tipoDocumento: string,
    file: Express.Multer.File,
  ): Promise<DocumentoCredito> {
    // Verificar se solicitação pertence à empresa
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id: solicitacaoId, empresaId, deletedAt: IsNull() },
    });

    if (!solicitacao) {
      throw new ForbiddenException('Solicitação não encontrada ou sem permissão');
    }

    const documento = this.documentoRepository.create({
      solicitacaoId,
      tipoDocumento,
      nomeArquivo: file.originalname,
      caminhoArquivo: file.path,
      tamanhoBytes: file.size,
      mimeType: file.mimetype,
      status: 'pendente',
    });

    const documentoSalvo = await this.documentoRepository.save(documento);

    // Verificar se todos documentos obrigatórios foram enviados
    const documentos = await this.documentoRepository.find({
      where: { solicitacaoId },
    });

    const tiposObrigatorios = ['documento_socio', 'contrato_social', 'comprovante_faturamento'];
    const todosEnviados = tiposObrigatorios.every((tipo) =>
      documentos.some((doc) => doc.tipoDocumento === tipo),
    );

    if (todosEnviados && solicitacao.status === 'em_analise') {
      solicitacao.status = 'documentacao_completa';
      await this.solicitacaoRepository.save(solicitacao);
    }

    return documentoSalvo;
  }

  async listar(empresaId: string, solicitacaoId: string): Promise<DocumentoCredito[]> {
    // Verificar permissão
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id: solicitacaoId, empresaId },
    });

    if (!solicitacao) {
      throw new ForbiddenException('Sem permissão para visualizar documentos');
    }

    return await this.documentoRepository.find({
      where: { solicitacaoId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async buscar(id: string, empresaId?: string): Promise<DocumentoCredito> {
    const documento = await this.documentoRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['solicitacao'],
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (empresaId && documento.solicitacao.empresaId !== empresaId) {
      throw new ForbiddenException('Sem permissão para acessar este documento');
    }

    return documento;
  }

  async excluir(id: string, empresaId: string): Promise<void> {
    const documento = await this.buscar(id, empresaId);

    if (documento.status !== 'pendente') {
      throw new ForbiddenException('Apenas documentos pendentes podem ser excluídos');
    }

    // Remover arquivo do disco
    if (fs.existsSync(documento.caminhoArquivo)) {
      fs.unlinkSync(documento.caminhoArquivo);
    }

    // Soft delete
    await this.documentoRepository.softDelete(id);
  }

  async validar(id: string, status: string, observacoes?: string, validadorId?: string): Promise<DocumentoCredito> {
    const documento = await this.documentoRepository.findOne({ where: { id } });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    documento.status = status;
    if (observacoes !== undefined) {
      documento.observacoes = observacoes;
    }
    if (validadorId !== undefined) {
      documento.validadoPor = validadorId;
    }
    documento.dataValidacao = new Date();

    return await this.documentoRepository.save(documento);
  }
}

