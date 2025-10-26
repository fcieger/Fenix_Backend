import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NFeIntegrationService } from './nfe-integration.service';
import { EmitirNFeDto } from './dto/emitir-nfe.dto';
import { SincronizarNFeDto } from './dto/sincronizar-nfe.dto';
import { WebhookNFeDto } from './dto/webhook-nfe.dto';
import { StatusNFeDto } from './dto/status-nfe.dto';
import { NFeApiResponse, WebhookNFeData } from './interfaces/nfe-api.interface';

@Controller('nfe-integration')
// @UseGuards(JwtAuthGuard)
export class NFeIntegrationController {
  private readonly logger = new Logger(NFeIntegrationController.name);

  constructor(private readonly nfeIntegrationService: NFeIntegrationService) {}

  /**
   * Emitir NFe via API externa
   */
  @Post('emitir/:nfeId')
  @HttpCode(HttpStatus.OK)
  async emitirNFe(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<NFeApiResponse> {
    this.logger.log(
      `Solicitação de emissão da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );

    try {
      const response = await this.nfeIntegrationService.emitirNFe(
        nfeId,
        req.user.activeCompanyId,
      );

      this.logger.log(`NFe ${nfeId} emitida com sucesso`);
      return response;
    } catch (error) {
      this.logger.error(`Erro ao emitir NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Sincronizar status de NFe
   */
  @Post('sincronizar/:nfeId')
  @HttpCode(HttpStatus.OK)
  async sincronizarNFe(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<{ message: string; success: boolean }> {
    this.logger.log(
      `Solicitação de sincronização da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );

    try {
      await this.nfeIntegrationService.sincronizarStatusNFe(nfeId);

      this.logger.log(`NFe ${nfeId} sincronizada com sucesso`);
      return {
        message: 'NFe sincronizada com sucesso',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao sincronizar NFe ${nfeId}:`, error);
      return {
        message: `Erro ao sincronizar NFe: ${error.message}`,
        success: false,
      };
    }
  }

  /**
   * Webhook para receber atualizações da API NFe
   * Este endpoint não usa JWT pois é chamado pela API externa
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async receberWebhook(
    @Body() webhookData: WebhookNFeDto,
  ): Promise<{ message: string; success: boolean }> {
    this.logger.log(`Recebendo webhook para NFe ${webhookData.nfeId}`);

    try {
      // Converter DTO para interface
      const webhookDataInterface: WebhookNFeData = {
        nfeId: webhookData.nfeId,
        empresaId: webhookData.empresaId,
        chaveAcesso: webhookData.chaveAcesso,
        status: webhookData.status,
        dataAtualizacao: webhookData.dataAtualizacao,
        xmlNfe: webhookData.xmlNfe,
        protocoloAutorizacao: webhookData.protocoloAutorizacao,
        erros: webhookData.erros,
      };

      await this.nfeIntegrationService.receberWebhookNFe(webhookDataInterface);

      this.logger.log(
        `Webhook da NFe ${webhookData.nfeId} processado com sucesso`,
      );
      return {
        message: 'Webhook processado com sucesso',
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao processar webhook da NFe ${webhookData.nfeId}:`,
        error,
      );
      return {
        message: `Erro ao processar webhook: ${error.message}`,
        success: false,
      };
    }
  }

  /**
   * Obter status de integração da NFe
   */
  @Get('status/:nfeId')
  async getStatusNFe(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<StatusNFeDto> {
    this.logger.log(
      `Consultando status da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );

    try {
      // Buscar NFe no banco para obter status atual
      const nfe = await this.nfeIntegrationService['nfeRepository'].findOne({
        where: { id: nfeId, companyId: req.user.activeCompanyId },
      });

      if (!nfe) {
        throw new Error('NFe não encontrada');
      }

      return {
        status: nfe.status,
        chaveAcesso: nfe.chaveAcesso,
        dataAutorizacao: nfe.dataAutorizacao?.toISOString(),
        protocoloAutorizacao: nfe.protocoloAutorizacao,
        ultimaAtualizacao: nfe.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Erro ao consultar status da NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Cancelar NFe
   */
  @Post('cancelar/:nfeId')
  async cancelarNFe(
    @Param('nfeId') nfeId: string,
    @Body() cancelarDto: { justificativa: string },
    @Request() req: any,
  ): Promise<{ message: string; status: string }> {
    this.logger.log(
      `Cancelando NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );
    return this.nfeIntegrationService.cancelarNFe(
      nfeId,
      cancelarDto.justificativa,
      req.user.activeCompanyId,
    );
  }

  /**
   * Download XML da NFe
   */
  @Get('xml/:nfeId')
  async downloadXML(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<{ xml: string; filename: string }> {
    this.logger.log(
      `Download XML da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );
    return this.nfeIntegrationService.downloadXML(
      nfeId,
      req.user.activeCompanyId,
    );
  }

  /**
   * Download PDF da NFe
   */
  @Get('pdf/:nfeId')
  async downloadPDF(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<{ pdf: string; filename: string }> {
    this.logger.log(
      `Download PDF da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );
    return this.nfeIntegrationService.downloadPDF(
      nfeId,
      req.user.activeCompanyId,
    );
  }

  /**
   * Download DANFE da NFe
   */
  @Get('danfe/:nfeId')
  async downloadDANFE(
    @Param('nfeId') nfeId: string,
    @Request() req: any,
  ): Promise<{ danfe: string; filename: string }> {
    this.logger.log(
      `Download DANFE da NFe ${nfeId} pela empresa ${req.user.activeCompanyId}`,
    );
    return this.nfeIntegrationService.downloadDANFE(
      nfeId,
      req.user.activeCompanyId,
    );
  }

  /**
   * Consultar NFe por chave de acesso
   */
  @Post('consulta/:chaveAcesso')
  async consultarNFe(
    @Param('chaveAcesso') chaveAcesso: string,
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(
      `Consultando NFe ${chaveAcesso} pela empresa ${req.user.activeCompanyId}`,
    );
    return this.nfeIntegrationService.consultarNFe(
      chaveAcesso,
      req.user.activeCompanyId,
    );
  }

  /**
   * Health check do serviço de integração
   */
  @Get('health')
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'NFe Integration Service',
    };
  }
}
