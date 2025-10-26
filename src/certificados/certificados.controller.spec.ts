import { Test, TestingModule } from '@nestjs/testing';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { JavaCertificadoService } from './java-certificado.service';
import { UpdateCertificadoDto } from './dto/certificado.dto';
import { BadRequestException } from '@nestjs/common';

describe('CertificadosController', () => {
  let controller: CertificadosController;
  let service: jest.Mocked<CertificadosService>;
  let javaService: jest.Mocked<JavaCertificadoService>;

  const mockCompanyId = 'company-1';
  const mockCertificadoId = 'certificado-1';

  const mockCertificadoResponse = {
    id: mockCertificadoId,
    nome: 'Empresa Teste LTDA',
    cnpj: '12.345.678/0001-90',
    validade: '2025-12-31',
    tipo: 'A1' as const,
    status: 'ativo' as const,
    nomeArquivo: 'certificado.pfx',
    dataUpload: '2024-01-01',
    ultimaVerificacao: '2024-01-01',
    diasRestantes: 30,
    observacoes: 'Certificado de teste',
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'user@test.com',
      companyId: mockCompanyId,
      companies: [
        {
          id: mockCompanyId,
          name: 'Test Company',
        },
      ],
    },
  };

  const mockRequestWithoutCompany = {
    user: {
      id: 'user-1',
      email: 'user@test.com',
    },
  };

  const mockFile = {
    originalname: 'certificado.pfx',
    buffer: Buffer.from('mock file content'),
    size: 2048,
    mimetype: 'application/x-pkcs12',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadosController],
      providers: [
        {
          provide: CertificadosService,
          useValue: {
            uploadCertificado: jest.fn(),
            getCertificado: jest.fn(),
            getAllCertificados: jest.fn(),
            updateCertificado: jest.fn(),
            deleteCertificado: jest.fn(),
            verificarCertificado: jest.fn(),
            getCertificadoById: jest.fn(),
          },
        },
        {
          provide: JavaCertificadoService,
          useValue: {
            testarConectividade: jest.fn(),
            validarCertificado: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CertificadosController>(CertificadosController);
    service = module.get(CertificadosService);
    javaService = module.get(JavaCertificadoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test endpoints', () => {
    it('should return test message', async () => {
      const result = await controller.test();

      expect(result).toEqual({ message: 'Certificados endpoint working' });
    });

    it('should test Java service connectivity', async () => {
      javaService.testarConectividade.mockResolvedValue(true);

      const result = await controller.testJava();

      expect(result).toEqual({
        message: 'Teste de conectividade com serviço Java',
        javaServiceAvailable: true,
        timestamp: expect.any(String),
      });
    });

    it('should handle Java service error', async () => {
      javaService.testarConectividade.mockRejectedValue(
        new Error('Connection failed'),
      );

      const result = await controller.testJava();

      expect(result).toEqual({
        message: 'Erro ao testar serviço Java',
        javaServiceAvailable: false,
        error: 'Connection failed',
        timestamp: expect.any(String),
      });
    });

    it('should test service', async () => {
      const result = await controller.testService();

      expect(result).toEqual({
        message: 'Service working',
        timestamp: expect.any(String),
      });
    });

    it('should test auth', async () => {
      const result = await controller.testAuth(mockRequest);

      expect(result).toEqual({
        message: 'Auth working',
        user: mockRequest.user,
        companyId: mockCompanyId,
        companies: mockRequest.user.companies,
        timestamp: expect.any(String),
      });
    });

    it('should debug', async () => {
      const result = await controller.debug();

      expect(result).toEqual({
        message: 'Debug endpoint working',
        timestamp: expect.any(String),
      });
    });
  });

  describe('uploadCertificado', () => {
    it('should upload certificate successfully', async () => {
      service.uploadCertificado.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.uploadCertificado(
        mockFile,
        'senha123',
        mockRequest,
      );

      expect(service.uploadCertificado).toHaveBeenCalledWith(
        mockFile,
        'senha123',
        mockCompanyId,
        mockRequest.user,
      );
      expect(result).toEqual(mockCertificadoResponse);
    });

    it('should throw error when password is not provided', async () => {
      await expect(
        controller.uploadCertificado(mockFile, '', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when companyId is not found', async () => {
      await expect(
        controller.uploadCertificado(
          mockFile,
          'senha123',
          mockRequestWithoutCompany,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid file format', async () => {
      const invalidFile = {
        ...mockFile,
        originalname: 'certificado.txt',
      };

      // Mock the service to throw the error
      service.uploadCertificado.mockRejectedValue(
        new BadRequestException(
          'Formato de arquivo inválido. Use apenas arquivos .pfx ou .p12',
        ),
      );

      await expect(
        controller.uploadCertificado(invalidFile, 'senha123', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCertificado', () => {
    it('should return certificate for authenticated user', async () => {
      service.getCertificado.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.getCertificado(mockRequest);

      expect(service.getCertificado).toHaveBeenCalledWith(mockCompanyId);
      expect(result).toEqual(mockCertificadoResponse);
    });

    it('should return null when no certificate found', async () => {
      service.getCertificado.mockResolvedValue(null);

      const result = await controller.getCertificado(mockRequest);

      expect(result).toBeNull();
    });

    it('should throw error when companyId is not found', async () => {
      await expect(
        controller.getCertificado(mockRequestWithoutCompany),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllCertificados', () => {
    it('should return all certificates for company', async () => {
      const mockCertificados = [mockCertificadoResponse];
      service.getAllCertificados.mockResolvedValue(mockCertificados);

      const result = await controller.getAllCertificados(mockRequest);

      expect(service.getAllCertificados).toHaveBeenCalledWith(mockCompanyId);
      expect(result).toEqual(mockCertificados);
    });

    it('should return empty array when no certificates found', async () => {
      service.getAllCertificados.mockResolvedValue([]);

      const result = await controller.getAllCertificados(mockRequest);

      expect(result).toEqual([]);
    });

    it('should throw error when companyId is not found', async () => {
      await expect(
        controller.getAllCertificados(mockRequestWithoutCompany),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCertificado', () => {
    it('should update certificate successfully', async () => {
      const updateData: UpdateCertificadoDto = {
        nome: 'Empresa Atualizada LTDA',
        observacoes: 'Certificado atualizado',
      };

      const updatedResponse = {
        ...mockCertificadoResponse,
        ...updateData,
      };

      service.updateCertificado.mockResolvedValue(updatedResponse);

      const result = await controller.updateCertificado(
        mockCertificadoId,
        updateData,
        mockRequest,
      );

      expect(service.updateCertificado).toHaveBeenCalledWith(
        mockCertificadoId,
        updateData,
        mockCompanyId,
      );
      expect(result).toEqual(updatedResponse);
    });

    it('should throw error when companyId is not found', async () => {
      const updateData: UpdateCertificadoDto = {
        nome: 'Empresa Atualizada LTDA',
      };

      await expect(
        controller.updateCertificado(
          mockCertificadoId,
          updateData,
          mockRequestWithoutCompany,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCertificado', () => {
    it('should delete certificate successfully', async () => {
      service.deleteCertificado.mockResolvedValue(undefined);

      await controller.deleteCertificado(mockCertificadoId, mockRequest);

      expect(service.deleteCertificado).toHaveBeenCalledWith(
        mockCertificadoId,
        mockCompanyId,
      );
    });

    it('should throw error when companyId is not found', async () => {
      await expect(
        controller.deleteCertificado(
          mockCertificadoId,
          mockRequestWithoutCompany,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verificarCertificado', () => {
    it('should verify certificate by ID', async () => {
      service.verificarCertificado.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.verificarCertificado(
        mockCertificadoId,
        mockRequest,
      );

      expect(service.verificarCertificado).toHaveBeenCalledWith(
        mockCertificadoId,
        mockCompanyId,
      );
      expect(result).toEqual(mockCertificadoResponse);
    });

    it('should verify certificate by company', async () => {
      service.getCertificado.mockResolvedValue(mockCertificadoResponse);
      service.verificarCertificado.mockResolvedValue(mockCertificadoResponse);

      const result =
        await controller.verificarCertificadoByCompany(mockRequest);

      expect(service.getCertificado).toHaveBeenCalledWith(mockCompanyId);
      expect(service.verificarCertificado).toHaveBeenCalledWith(
        mockCertificadoId,
        mockCompanyId,
      );
      expect(result).toEqual(mockCertificadoResponse);
    });

    it('should throw error when certificate not found for company verification', async () => {
      service.getCertificado.mockResolvedValue(null);

      await expect(
        controller.verificarCertificadoByCompany(mockRequest),
      ).rejects.toThrow('Certificado não encontrado');
    });
  });

  describe('deleteCertificadoByCompany', () => {
    it('should delete certificate by company', async () => {
      service.getCertificado.mockResolvedValue(mockCertificadoResponse);
      service.deleteCertificado.mockResolvedValue(undefined);

      await controller.deleteCertificadoByCompany(mockRequest);

      expect(service.getCertificado).toHaveBeenCalledWith(mockCompanyId);
      expect(service.deleteCertificado).toHaveBeenCalledWith(
        mockCertificadoId,
        mockCompanyId,
      );
    });

    it('should handle when no certificate found for company', async () => {
      service.getCertificado.mockResolvedValue(null);

      await controller.deleteCertificadoByCompany(mockRequest);

      expect(service.getCertificado).toHaveBeenCalledWith(mockCompanyId);
      expect(service.deleteCertificado).not.toHaveBeenCalled();
    });
  });

  describe('testServiceDirect', () => {
    it('should test service direct with certificate ID', async () => {
      service.getCertificadoById.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.testServiceDirect(mockCertificadoId);

      expect(service.getCertificadoById).toHaveBeenCalledWith(
        mockCertificadoId,
      );
      expect(result).toEqual({
        message: 'Certificate found',
        cert: mockCertificadoResponse,
        timestamp: expect.any(String),
      });
    });

    it('should handle certificate not found', async () => {
      service.getCertificadoById.mockRejectedValue(
        new Error('Certificate not found'),
      );

      const result = await controller.testServiceDirect(mockCertificadoId);

      expect(result).toEqual({
        message: 'Certificate not found',
        error: 'Certificate not found',
        timestamp: expect.any(String),
      });
    });
  });

  describe('testByCompany', () => {
    it('should test certificate search by company', async () => {
      service.getCertificado.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.testByCompany(mockCompanyId);

      expect(service.getCertificado).toHaveBeenCalledWith(mockCompanyId);
      expect(result).toEqual({
        message: 'Certificate search by companyId',
        cert: mockCertificadoResponse,
        companyId: mockCompanyId,
        timestamp: expect.any(String),
      });
    });

    it('should handle certificate search failure', async () => {
      service.getCertificado.mockRejectedValue(new Error('Search failed'));

      const result = await controller.testByCompany(mockCompanyId);

      expect(result).toEqual({
        message: 'Certificate search failed',
        error: 'Search failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('business scenarios', () => {
    it('should handle A3 certificate upload', async () => {
      const a3File = {
        ...mockFile,
        originalname: 'certificado_a3.pfx',
      };

      const a3Response = {
        ...mockCertificadoResponse,
        tipo: 'A3' as const,
      };

      service.uploadCertificado.mockResolvedValue(a3Response);

      const result = await controller.uploadCertificado(
        a3File,
        'senha123',
        mockRequest,
      );

      expect(result.tipo).toBe('A3');
    });

    it('should handle expired certificate verification', async () => {
      const expiredResponse = {
        ...mockCertificadoResponse,
        status: 'expirado' as const,
        diasRestantes: -30,
      };

      service.verificarCertificado.mockResolvedValue(expiredResponse);

      const result = await controller.verificarCertificado(
        mockCertificadoId,
        mockRequest,
      );

      expect(result.status).toBe('expirado');
      expect(result.diasRestantes).toBe(-30);
    });

    it('should handle certificate with Java service integration', async () => {
      javaService.testarConectividade.mockResolvedValue(true);
      service.uploadCertificado.mockResolvedValue(mockCertificadoResponse);

      const result = await controller.uploadCertificado(
        mockFile,
        'senha123',
        mockRequest,
      );

      expect(result).toEqual(mockCertificadoResponse);
    });
  });
});
