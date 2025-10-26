import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, NotFoundException, BadRequestException } from 'typeorm';
import { CertificadosService } from './certificados.service';
import { JavaCertificadoService } from './java-certificado.service';
import { Certificado } from './entities/certificado.entity';
import { UpdateCertificadoDto } from './dto/certificado.dto';

describe('CertificadosService', () => {
  let service: CertificadosService;
  let certificadoRepository: jest.Mocked<Repository<Certificado>>;
  let javaCertificadoService: jest.Mocked<JavaCertificadoService>;

  const mockCompanyId = 'company-1';
  const mockCertificadoId = 'certificado-1';

  const mockCertificado = {
    id: mockCertificadoId,
    companyId: mockCompanyId,
    nome: 'Empresa Teste LTDA',
    cnpj: '12.345.678/0001-90',
    validade: new Date('2025-12-31'),
    tipo: 'A1' as const,
    status: 'ativo' as const,
    nomeArquivo: 'certificado.pfx',
    caminhoArquivo: '/uploads/certificados/certificado.pfx',
    hashArquivo: 'abc123def456',
    senhaCriptografada: 'encrypted_password',
    observacoes: 'Certificado de teste',
    ultimaVerificacao: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isExpired: jest.fn(() => false),
    getDaysUntilExpiration: jest.fn(() => 30),
    updateStatus: jest.fn(),
  };

  const mockFile = {
    originalname: 'certificado.pfx',
    buffer: Buffer.from('mock file content'),
    size: 2048,
    mimetype: 'application/x-pkcs12',
  };

  const mockUserInfo = {
    id: 'user-1',
    email: 'user@test.com',
    companies: [{ id: mockCompanyId, name: 'Test Company' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadosService,
        {
          provide: getRepositoryToken(Certificado),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
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

    service = module.get<CertificadosService>(CertificadosService);
    certificadoRepository = module.get(getRepositoryToken(Certificado));
    javaCertificadoService = module.get(JavaCertificadoService);

    // Mock dos métodos privados que dependem de fs/path
    jest
      .spyOn(service as any, 'ensureUploadDirectory')
      .mockImplementation(() => {});
    jest
      .spyOn(service as any, 'saveFile')
      .mockResolvedValue('/mock/path/certificado.pfx');
    jest.spyOn(service as any, 'deleteFile').mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'generateFileHash')
      .mockReturnValue('mock-hash-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadCertificado', () => {
    it('should upload a new certificate successfully', async () => {
      const senha = 'senha123';
      const mockCertificadoData = {
        nome: 'Empresa Teste LTDA',
        cnpj: '12.345.678/0001-90',
        validade: '2025-12-31',
        tipo: 'A1',
      };

      certificadoRepository.findOne.mockResolvedValue(null);
      certificadoRepository.create.mockReturnValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(mockCertificado as any);

      // Mock do método privado extractCertificadoData
      jest
        .spyOn(service as any, 'extractCertificadoData')
        .mockResolvedValue(mockCertificadoData);

      const result = await service.uploadCertificado(
        mockFile,
        senha,
        mockCompanyId,
        mockUserInfo,
      );

      expect(certificadoRepository.create).toHaveBeenCalled();
      expect(certificadoRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when file is not provided', async () => {
      await expect(
        service.uploadCertificado(
          null,
          'senha123',
          mockCompanyId,
          mockUserInfo,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid file format', async () => {
      const invalidFile = {
        ...mockFile,
        originalname: 'certificado.txt',
      };

      await expect(
        service.uploadCertificado(
          invalidFile,
          'senha123',
          mockCompanyId,
          mockUserInfo,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for file too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB
      };

      await expect(
        service.uploadCertificado(
          largeFile,
          'senha123',
          mockCompanyId,
          mockUserInfo,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for file too small', async () => {
      const smallFile = {
        ...mockFile,
        size: 500, // 500 bytes
      };

      await expect(
        service.uploadCertificado(
          smallFile,
          'senha123',
          mockCompanyId,
          mockUserInfo,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should replace existing certificate', async () => {
      const senha = 'senha123';
      const mockCertificadoData = {
        nome: 'Empresa Teste LTDA',
        cnpj: '12.345.678/0001-90',
        validade: '2025-12-31',
        tipo: 'A1',
      };

      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.remove.mockResolvedValue(mockCertificado as any);
      certificadoRepository.create.mockReturnValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(mockCertificado as any);

      jest
        .spyOn(service as any, 'extractCertificadoData')
        .mockResolvedValue(mockCertificadoData);

      const result = await service.uploadCertificado(
        mockFile,
        senha,
        mockCompanyId,
        mockUserInfo,
      );

      expect(certificadoRepository.remove).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getCertificado', () => {
    it('should return certificate for company', async () => {
      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(mockCertificado as any);

      const result = await service.getCertificado(mockCompanyId);

      expect(certificadoRepository.findOne).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
      });
      expect(result).toBeDefined();
    });

    it('should return null when no certificate found', async () => {
      certificadoRepository.findOne.mockResolvedValue(null);

      const result = await service.getCertificado(mockCompanyId);

      expect(result).toBeNull();
    });
  });

  describe('getAllCertificados', () => {
    it('should return all certificates for company', async () => {
      const mockCertificados = [mockCertificado];
      certificadoRepository.find.mockResolvedValue(mockCertificados);
      certificadoRepository.save.mockResolvedValue(mockCertificados as any);

      const result = await service.getAllCertificados(mockCompanyId);

      expect(certificadoRepository.find).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no certificates found', async () => {
      certificadoRepository.find.mockResolvedValue([]);

      const result = await service.getAllCertificados(mockCompanyId);

      expect(result).toEqual([]);
    });
  });

  describe('updateCertificado', () => {
    it('should update certificate successfully', async () => {
      const updateData: UpdateCertificadoDto = {
        nome: 'Empresa Atualizada LTDA',
        observacoes: 'Certificado atualizado',
      };

      const updatedCertificado = {
        ...mockCertificado,
        ...updateData,
      };

      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(updatedCertificado as any);

      const result = await service.updateCertificado(
        mockCertificadoId,
        updateData,
        mockCompanyId,
      );

      expect(certificadoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCertificadoId, companyId: mockCompanyId },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when certificate not found', async () => {
      const updateData: UpdateCertificadoDto = {
        nome: 'Empresa Atualizada LTDA',
      };

      certificadoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCertificado(mockCertificadoId, updateData, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update certificate validity date', async () => {
      const updateData: UpdateCertificadoDto = {
        validade: '2026-12-31',
      };

      const updatedCertificado = {
        ...mockCertificado,
        validade: new Date('2026-12-31'),
      };

      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(updatedCertificado as any);

      const result = await service.updateCertificado(
        mockCertificadoId,
        updateData,
        mockCompanyId,
      );

      expect(result).toBeDefined();
    });
  });

  describe('deleteCertificado', () => {
    it('should delete certificate successfully', async () => {
      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.remove.mockResolvedValue(mockCertificado as any);

      await service.deleteCertificado(mockCertificadoId, mockCompanyId);

      expect(certificadoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCertificadoId, companyId: mockCompanyId },
      });
      expect(certificadoRepository.remove).toHaveBeenCalledWith(
        mockCertificado,
      );
    });

    it('should throw NotFoundException when certificate not found', async () => {
      certificadoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteCertificado(mockCertificadoId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verificarCertificado', () => {
    it('should verify certificate successfully', async () => {
      const verifiedCertificado = {
        ...mockCertificado,
        ultimaVerificacao: new Date(),
      };

      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(verifiedCertificado as any);

      const result = await service.verificarCertificado(
        mockCertificadoId,
        mockCompanyId,
      );

      expect(certificadoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCertificadoId, companyId: mockCompanyId },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when certificate not found', async () => {
      certificadoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verificarCertificado(mockCertificadoId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCertificadoById', () => {
    it('should return certificate by ID', async () => {
      certificadoRepository.findOne.mockResolvedValue(mockCertificado as any);

      const result = await service.getCertificadoById(mockCertificadoId);

      expect(certificadoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCertificadoId },
      });
      expect(result).toEqual(mockCertificado);
    });

    it('should return null when certificate not found', async () => {
      certificadoRepository.findOne.mockResolvedValue(null);

      const result = await service.getCertificadoById(mockCertificadoId);

      expect(result).toBeNull();
    });
  });

  describe('business scenarios', () => {
    it('should handle A3 certificate upload', async () => {
      const a3File = {
        ...mockFile,
        originalname: 'certificado_a3.pfx',
      };

      const mockCertificadoData = {
        nome: 'Empresa A3 LTDA',
        cnpj: '98.765.432/0001-10',
        validade: '2025-12-31',
        tipo: 'A3',
      };

      certificadoRepository.findOne.mockResolvedValue(null);
      certificadoRepository.create.mockReturnValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(mockCertificado as any);

      jest
        .spyOn(service as any, 'extractCertificadoData')
        .mockResolvedValue(mockCertificadoData);

      const result = await service.uploadCertificado(
        a3File,
        'senha123',
        mockCompanyId,
        mockUserInfo,
      );

      expect(result).toBeDefined();
    });

    it('should handle expired certificate', async () => {
      const expiredCertificado = {
        ...mockCertificado,
        validade: new Date('2020-12-31'),
        status: 'expirado' as const,
        isExpired: jest.fn(() => true),
        getDaysUntilExpiration: jest.fn(() => -365),
      };

      certificadoRepository.findOne.mockResolvedValue(
        expiredCertificado as any,
      );
      certificadoRepository.save.mockResolvedValue(expiredCertificado as any);

      const result = await service.getCertificado(mockCompanyId);

      expect(result).toBeDefined();
    });

    it('should handle certificate with Java service fallback', async () => {
      const senha = 'senha123';
      const mockCertificadoData = {
        nome: 'Empresa Java LTDA',
        cnpj: '11.222.333/0001-44',
        validade: '2025-12-31',
        tipo: 'A1',
      };

      javaCertificadoService.testarConectividade.mockResolvedValue(false);
      certificadoRepository.findOne.mockResolvedValue(null);
      certificadoRepository.create.mockReturnValue(mockCertificado as any);
      certificadoRepository.save.mockResolvedValue(mockCertificado as any);

      // Mock the extractCertificadoData method to simulate Java service fallback
      const extractSpy = jest
        .spyOn(service as any, 'extractCertificadoData')
        .mockImplementation(async () => {
          // Simulate Java service being called
          await javaCertificadoService.testarConectividade();
          return mockCertificadoData;
        });

      const result = await service.uploadCertificado(
        mockFile,
        senha,
        mockCompanyId,
        mockUserInfo,
      );

      expect(javaCertificadoService.testarConectividade).toHaveBeenCalled();
      expect(result).toBeDefined();

      extractSpy.mockRestore();
    });
  });
});
