import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, NotFoundException } from 'typeorm';
import { CadastrosService } from './cadastros.service';
import { Cadastro } from './entities/cadastro.entity';
import { CreateCadastroDto } from './dto/create-cadastro.dto';

describe('CadastrosService', () => {
  let service: CadastrosService;
  let cadastrosRepository: jest.Mocked<Repository<Cadastro>>;

  const mockCompanyId = 'company-1';
  const mockCadastroId = 'cadastro-1';

  const mockCadastro = {
    id: mockCadastroId,
    companyId: mockCompanyId,
    nomeRazaoSocial: 'João Silva',
    nomeFantasia: 'João Silva ME',
    tipoPessoa: 'Pessoa Física' as const,
    cpf: '12345678901',
    cnpj: null,
    tiposCliente: {
      cliente: true,
      vendedor: false,
      fornecedor: false,
      funcionario: false,
      transportadora: false,
      prestadorServico: false,
    },
    email: 'joao@email.com',
    pessoaContato: 'João Silva',
    telefoneComercial: '1133334444',
    celular: '1199998888',
    cargo: 'Proprietário',
    celularContato: '1199998888',
    optanteSimples: true,
    orgaoPublico: false,
    ie: null,
    im: null,
    suframa: null,
    contatos: [
      {
        email: 'joao@email.com',
        pessoaContato: 'João Silva',
        telefoneComercial: '1133334444',
        celular: '1199998888',
        cargo: 'Proprietário',
        principal: true,
      },
    ],
    enderecos: [
      {
        tipo: 'Comercial',
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 1',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567',
        principal: true,
      },
    ],
    observacoes: 'Cliente VIP',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateCadastroDto: CreateCadastroDto = {
    nomeRazaoSocial: 'João Silva',
    nomeFantasia: 'João Silva ME',
    tipoPessoa: 'Pessoa Física',
    cpf: '12345678901',
    tiposCliente: {
      cliente: true,
      vendedor: false,
      fornecedor: false,
      funcionario: false,
      transportadora: false,
      prestadorServico: false,
    },
    email: 'joao@email.com',
    pessoaContato: 'João Silva',
    telefoneComercial: '1133334444',
    celular: '1199998888',
    cargo: 'Proprietário',
    celularContato: '1199998888',
    optanteSimples: true,
    orgaoPublico: false,
    contatos: [
      {
        email: 'joao@email.com',
        pessoaContato: 'João Silva',
        telefoneComercial: '1133334444',
        celular: '1199998888',
        cargo: 'Proprietário',
        principal: true,
      },
    ],
    enderecos: [
      {
        tipo: 'Comercial',
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 1',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567',
        principal: true,
      },
    ],
    observacoes: 'Cliente VIP',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CadastrosService,
        {
          provide: getRepositoryToken(Cadastro),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CadastrosService>(CadastrosService);
    cadastrosRepository = module.get(getRepositoryToken(Cadastro));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cadastro', async () => {
      cadastrosRepository.create.mockReturnValue(mockCadastro as any);
      cadastrosRepository.save.mockResolvedValue(mockCadastro as any);

      const result = await service.create(mockCreateCadastroDto, mockCompanyId);

      expect(cadastrosRepository.create).toHaveBeenCalledWith({
        ...mockCreateCadastroDto,
        companyId: mockCompanyId,
      });
      expect(cadastrosRepository.save).toHaveBeenCalledWith(mockCadastro);
      expect(result).toEqual(mockCadastro);
    });

    it('should create cadastro for pessoa jurídica', async () => {
      const juridicaDto: CreateCadastroDto = {
        nomeRazaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Empresa Teste',
        tipoPessoa: 'Pessoa Jurídica',
        cnpj: '12345678000195',
        tiposCliente: {
          cliente: true,
          vendedor: false,
          fornecedor: true,
          funcionario: false,
          transportadora: false,
          prestadorServico: false,
        },
        email: 'contato@empresateste.com',
        pessoaContato: 'Maria Silva',
        telefoneComercial: '1133334444',
        celular: '1199998888',
        cargo: 'Gerente',
        optanteSimples: false,
        orgaoPublico: false,
        ie: '123456789',
        im: '987654321',
      };

      const juridicaCadastro = {
        ...mockCadastro,
        ...juridicaDto,
        tipoPessoa: 'Pessoa Jurídica' as const,
        cnpj: '12345678000195',
        cpf: null,
      };

      cadastrosRepository.create.mockReturnValue(juridicaCadastro as any);
      cadastrosRepository.save.mockResolvedValue(juridicaCadastro as any);

      const result = await service.create(juridicaDto, mockCompanyId);

      expect(result).toEqual(juridicaCadastro);
    });

    it('should create cadastro with multiple contacts and addresses', async () => {
      const complexDto: CreateCadastroDto = {
        nomeRazaoSocial: 'Cliente Complexo',
        tipoPessoa: 'Pessoa Física',
        cpf: '98765432100',
        tiposCliente: {
          cliente: true,
          vendedor: false,
          fornecedor: false,
          funcionario: false,
          transportadora: false,
          prestadorServico: true,
        },
        contatos: [
          {
            email: 'principal@cliente.com',
            pessoaContato: 'João Principal',
            telefoneComercial: '1133334444',
            principal: true,
          },
          {
            email: 'secundario@cliente.com',
            pessoaContato: 'Maria Secundária',
            celular: '1199998888',
            principal: false,
          },
        ],
        enderecos: [
          {
            tipo: 'Residencial',
            logradouro: 'Rua Principal',
            numero: '456',
            bairro: 'Vila Nova',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '04567890',
            principal: true,
          },
          {
            tipo: 'Comercial',
            logradouro: 'Av. Comercial',
            numero: '789',
            complemento: 'Andar 5',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01234567',
            principal: false,
          },
        ],
        observacoes: 'Cliente com múltiplos contatos e endereços',
      };

      const complexCadastro = {
        ...mockCadastro,
        ...complexDto,
      };

      cadastrosRepository.create.mockReturnValue(complexCadastro as any);
      cadastrosRepository.save.mockResolvedValue(complexCadastro as any);

      const result = await service.create(complexDto, mockCompanyId);

      expect(result).toEqual(complexCadastro);
    });
  });

  describe('findAll', () => {
    it('should return all cadastros for a company', async () => {
      const mockCadastros = [mockCadastro];
      cadastrosRepository.find.mockResolvedValue(mockCadastros);

      const result = await service.findAll(mockCompanyId);

      expect(cadastrosRepository.find).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockCadastros);
    });

    it('should return empty array when no cadastros found', async () => {
      cadastrosRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockCompanyId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific cadastro', async () => {
      cadastrosRepository.findOne.mockResolvedValue(mockCadastro as any);

      const result = await service.findOne(mockCadastroId, mockCompanyId);

      expect(cadastrosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCadastroId, companyId: mockCompanyId },
      });
      expect(result).toEqual(mockCadastro);
    });

    it('should throw NotFoundException when cadastro not found', async () => {
      cadastrosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockCadastroId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when cadastro belongs to different company', async () => {
      cadastrosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockCadastroId, 'other-company'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cadastro', async () => {
      const updateData = {
        nomeRazaoSocial: 'João Silva Atualizado',
        email: 'joao.novo@email.com',
        observacoes: 'Cliente atualizado',
      };

      const updatedCadastro = {
        ...mockCadastro,
        ...updateData,
      };

      cadastrosRepository.findOne.mockResolvedValue(mockCadastro as any);
      cadastrosRepository.save.mockResolvedValue(updatedCadastro as any);

      const result = await service.update(
        mockCadastroId,
        updateData,
        mockCompanyId,
      );

      expect(cadastrosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCadastroId, companyId: mockCompanyId },
      });
      expect(cadastrosRepository.save).toHaveBeenCalledWith(updatedCadastro);
      expect(result).toEqual(updatedCadastro);
    });

    it('should throw NotFoundException when updating non-existent cadastro', async () => {
      const updateData = {
        nomeRazaoSocial: 'João Silva Atualizado',
      };

      cadastrosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockCadastroId, updateData, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update cadastro types', async () => {
      const typesUpdate = {
        tiposCliente: {
          cliente: true,
          vendedor: true,
          fornecedor: false,
          funcionario: false,
          transportadora: false,
          prestadorServico: false,
        },
      };

      const updatedCadastro = {
        ...mockCadastro,
        ...typesUpdate,
      };

      cadastrosRepository.findOne.mockResolvedValue(mockCadastro as any);
      cadastrosRepository.save.mockResolvedValue(updatedCadastro as any);

      const result = await service.update(
        mockCadastroId,
        typesUpdate,
        mockCompanyId,
      );

      expect(result).toEqual(updatedCadastro);
    });
  });

  describe('remove', () => {
    it('should delete a cadastro', async () => {
      cadastrosRepository.findOne.mockResolvedValue(mockCadastro as any);
      cadastrosRepository.remove.mockResolvedValue(mockCadastro as any);

      await service.remove(mockCadastroId, mockCompanyId);

      expect(cadastrosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCadastroId, companyId: mockCompanyId },
      });
      expect(cadastrosRepository.remove).toHaveBeenCalledWith(mockCadastro);
    });

    it('should throw NotFoundException when removing non-existent cadastro', async () => {
      cadastrosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(mockCadastroId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('business scenarios', () => {
    it('should handle fornecedor cadastro', async () => {
      const fornecedorDto: CreateCadastroDto = {
        nomeRazaoSocial: 'Fornecedor ABC LTDA',
        nomeFantasia: 'Fornecedor ABC',
        tipoPessoa: 'Pessoa Jurídica',
        cnpj: '98765432000123',
        tiposCliente: {
          cliente: false,
          vendedor: false,
          fornecedor: true,
          funcionario: false,
          transportadora: false,
          prestadorServico: false,
        },
        email: 'contato@fornecedorabc.com',
        pessoaContato: 'Carlos Fornecedor',
        telefoneComercial: '1144445555',
        optanteSimples: true,
        orgaoPublico: false,
        ie: '987654321',
        observacoes: 'Fornecedor de materiais',
      };

      const fornecedorCadastro = {
        ...mockCadastro,
        ...fornecedorDto,
        tipoPessoa: 'Pessoa Jurídica' as const,
      };

      cadastrosRepository.create.mockReturnValue(fornecedorCadastro as any);
      cadastrosRepository.save.mockResolvedValue(fornecedorCadastro as any);

      const result = await service.create(fornecedorDto, mockCompanyId);

      expect(result).toEqual(fornecedorCadastro);
    });

    it('should handle transportadora cadastro', async () => {
      const transportadoraDto: CreateCadastroDto = {
        nomeRazaoSocial: 'Transportadora XYZ LTDA',
        nomeFantasia: 'Trans XYZ',
        tipoPessoa: 'Pessoa Jurídica',
        cnpj: '11111111000111',
        tiposCliente: {
          cliente: false,
          vendedor: false,
          fornecedor: false,
          funcionario: false,
          transportadora: true,
          prestadorServico: false,
        },
        email: 'contato@transxyz.com',
        pessoaContato: 'Ana Transportadora',
        telefoneComercial: '1155556666',
        optanteSimples: false,
        orgaoPublico: false,
        ie: '111111111',
        observacoes: 'Transportadora especializada em cargas',
      };

      const transportadoraCadastro = {
        ...mockCadastro,
        ...transportadoraDto,
        tipoPessoa: 'Pessoa Jurídica' as const,
      };

      cadastrosRepository.create.mockReturnValue(transportadoraCadastro as any);
      cadastrosRepository.save.mockResolvedValue(transportadoraCadastro as any);

      const result = await service.create(transportadoraDto, mockCompanyId);

      expect(result).toEqual(transportadoraCadastro);
    });
  });
});
