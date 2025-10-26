import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JavaCertificadoResponse {
  nome: string;
  cnpj: string;
  validade: string;
  tipo: 'A1' | 'A3';
  status: 'ativo' | 'expirado' | 'inativo';
  diasRestantes?: number;
}

@Injectable()
export class JavaCertificadoService {
  private readonly logger = new Logger(JavaCertificadoService.name);
  private readonly javaServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.javaServiceUrl =
      this.configService.get<string>('JAVA_CERTIFICADO_SERVICE_URL') ||
      'http://localhost:3002';
  }

  /**
   * Valida um certificado usando o serviço Java
   */
  async validarCertificado(
    arquivo: Buffer,
    nomeArquivo: string,
    senha: string,
  ): Promise<JavaCertificadoResponse> {
    try {
      this.logger.log(`Validando certificado ${nomeArquivo} com serviço Java`);

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(arquivo)], {
        type: 'application/x-pkcs12',
      });
      formData.append('arquivo', blob, nomeArquivo);
      formData.append('senha', senha);

      const response = await fetch(
        `${this.javaServiceUrl}/api/java-certificado/validar`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Erro na validação Java: ${response.status} - ${errorText}`,
        );
        throw new Error(`Erro na validação do certificado: ${response.status}`);
      }

      const result = await response.json();
      this.logger.log(`Certificado validado com sucesso: ${result.nome}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao validar certificado com serviço Java: ${error.message}`,
      );
      throw new Error(`Falha na validação do certificado: ${error.message}`);
    }
  }

  /**
   * Testa se o serviço Java está disponível
   */
  async testarConectividade(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.javaServiceUrl}/api/java-certificado/test`,
        {
          method: 'GET',
          timeout: 5000,
        } as any,
      );

      return response.ok;
    } catch (error) {
      this.logger.warn(`Serviço Java não disponível: ${error.message}`);
      return false;
    }
  }

  /**
   * Faz upload de certificado para o serviço Java
   */
  async uploadCertificado(
    arquivo: Buffer,
    nomeArquivo: string,
    senha: string,
    companyId: string,
  ): Promise<JavaCertificadoResponse> {
    try {
      this.logger.log(
        `Fazendo upload do certificado ${nomeArquivo} para serviço Java`,
      );

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(arquivo)], {
        type: 'application/x-pkcs12',
      });
      formData.append('arquivo', blob, nomeArquivo);
      formData.append('senha', senha);
      formData.append('companyId', companyId);

      const response = await fetch(
        `${this.javaServiceUrl}/api/java-certificado/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Erro no upload Java: ${response.status} - ${errorText}`,
        );
        throw new Error(`Erro no upload do certificado: ${response.status}`);
      }

      const result = await response.json();
      this.logger.log(`Certificado enviado com sucesso: ${result.nome}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao fazer upload com serviço Java: ${error.message}`,
      );
      throw new Error(`Falha no upload do certificado: ${error.message}`);
    }
  }
}
