import { Test, TestingModule } from '@nestjs/testing';
import { CadastrosController } from './cadastros.controller';
import { CadastrosService } from './cadastros.service';
import { CreateCadastroDto } from './dto/create-cadastro.dto';

describe('CadastrosController', () => {
  let controller: CadastrosController;
  let service: jest.Mocked<CadastrosService>;

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

  const mockRequest = {
    user: {
      companies: [
        {
          id: mockCompanyId,
          name: 'Test Company',
        },
      ],
    },
  };

  const mockRequestWithoutCompanies = {
    user: {
      companies: [],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CadastrosController],
      providers: [
        {
          provide: CadastrosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CadastrosController>(CadastrosController);
    service = module.get(CadastrosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cadastro', async () => {
      const createDto: CreateCadastroDto = {
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
        observacoes: 'Cliente VIP',
      };

      service.create.mockResolvedValue(mockCadastro as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockCompanyId);
      expect(result).toEqual(mockCadastro);
    });

    it('should create cadastro with companyId from DTO', async () => {
      const createDtoWithCompany: CreateCadastroDto = {
        nomeRazaoSocial: 'João Silva',
        tipoPessoa: 'Pessoa Física',
        cpf: '12345678901',
        companyId: 'specific-company-id',
        tiposCliente: {
          cliente: true,
          vendedor: false,
          fornecedor: false,
          funcionario: false,
          transportadora: false,
          prestadorServico: false,
        },
      };

      const expectedData = {
        nomeRazaoSocial: 'João Silva',
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
      };

      service.create.mockResolvedValue(mockCadastro as any);

      const result = await controller.create(createDtoWithCompany, mockRequest);

      expect(service.create).toHaveBeenCalledWith(
        expectedData,
        'specific-company-id',
      );
      expect(result).toEqual(mockCadastro);
    });

    it('should throw error when user has no companies', async () => {
      const createDto: CreateCadastroDto = {
        nomeRazaoSocial: 'João Silva',
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
      };

      await expect(
        controller.create(createDto, mockRequestWithoutCompanies),
      ).rejects.toThrow('Usuário não possui empresas associadas');
    });

    it('should create pessoa jurídica cadastro', async () => {
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
      };

      service.create.mockResolvedValue(juridicaCadastro as any);

      const result = await controller.create(juridicaDto, mockRequest);

      expect(result).toEqual(juridicaCadastro);
    });
  });

  describe('findAll', () => {
    it('should return all cadastros for authenticated user', async () => {
      const mockCadastros = [mockCadastro];
      service.findAll.mockResolvedValue(mockCadastros);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockCompanyId);
      expect(result).toEqual(mockCadastros);
    });

    it('should return empty array when no cadastros found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific cadastro', async () => {
      service.findOne.mockResolvedValue(mockCadastro as any);

      const result = await controller.findOne(mockCadastroId, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(
        mockCadastroId,
        mockCompanyId,
      );
      expect(result).toEqual(mockCadastro);
    });
  });

  describe('update', () => {
    it('should update a cadastro', async () => {
      const updateDto = {
        nomeRazaoSocial: 'João Silva Atualizado',
        email: 'joao.novo@email.com',
        observacoes: 'Cliente atualizado',
      };

      const updatedCadastro = {
        ...mockCadastro,
        ...updateDto,
      };

      service.update.mockResolvedValue(updatedCadastro as any);

      const result = await controller.update(
        mockCadastroId,
        updateDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockCadastroId,
        updateDto,
        mockCompanyId,
      );
      expect(result).toEqual(updatedCadastro);
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

      service.update.mockResolvedValue(updatedCadastro as any);

      const result = await controller.update(
        mockCadastroId,
        typesUpdate,
        mockRequest,
      );

      expect(result).toEqual(updatedCadastro);
    });
  });

  describe('remove', () => {
    it('should delete a cadastro', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockCadastroId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(
        mockCadastroId,
        mockCompanyId,
      );
      expect(result).toEqual({ message: 'Cadastro removido com sucesso' });
    });
  });

  describe('business scenarios', () => {
    it('should handle fornecedor cadastro creation', async () => {
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

      service.create.mockResolvedValue(fornecedorCadastro as any);

      const result = await controller.create(fornecedorDto, mockRequest);

      expect(result).toEqual(fornecedorCadastro);
    });

    it('should handle transportadora cadastro creation', async () => {
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

      service.create.mockResolvedValue(transportadoraCadastro as any);

      const result = await controller.create(transportadoraDto, mockRequest);

      expect(result).toEqual(transportadoraCadastro);
    });

    it('should handle prestador de serviço cadastro', async () => {
      const prestadorDto: CreateCadastroDto = {
        nomeRazaoSocial: 'Serviços ABC LTDA',
        nomeFantasia: 'Serv ABC',
        tipoPessoa: 'Pessoa Jurídica',
        cnpj: '22222222000222',
        tiposCliente: {
          cliente: false,
          vendedor: false,
          fornecedor: false,
          funcionario: false,
          transportadora: false,
          prestadorServico: true,
        },
        email: 'contato@servabc.com',
        pessoaContato: 'Pedro Serviços',
        telefoneComercial: '1166667777',
        optanteSimples: true,
        orgaoPublico: false,
        ie: '222222222',
        observacoes: 'Prestador de serviços técnicos',
      };

      const prestadorCadastro = {
        ...mockCadastro,
        ...prestadorDto,
        tipoPessoa: 'Pessoa Jurídica' as const,
      };

      service.create.mockResolvedValue(prestadorCadastro as any);

      const result = await controller.create(prestadorDto, mockRequest);

      expect(result).toEqual(prestadorCadastro);
    });
  });
});
