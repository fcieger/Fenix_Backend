import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let companiesService: jest.Mocked<CompaniesService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '123456789',
    password: 'hashedPassword',
    companies: [],
  };

  const mockCompany = {
    id: '1',
    name: 'Test Company',
    cnpj: '12345678000195',
    token: 'company-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            create: jest.fn(),
            findByToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    companiesService = module.get(CompaniesService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        password,
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        companies: mockUser.companies,
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        password,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '123456789',
        companies: [mockCompany],
      };

      const mockToken = 'jwt-token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          companies: user.companies,
        },
      });
    });
  });

  describe('register', () => {
    it('should create user and company and return login data', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        phone: '987654321',
        password: 'password123',
      };

      const companyData = {
        name: 'New Company',
        cnpj: '98765432000195',
      };

      const createdUser = { ...mockUser, ...userData };
      const createdCompany = { ...mockCompany, ...companyData };

      usersService.create.mockResolvedValue(createdUser);
      companiesService.create.mockResolvedValue(createdCompany);
      usersService.save.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(userData, companyData);

      expect(usersService.create).toHaveBeenCalledWith(userData);
      expect(companiesService.create).toHaveBeenCalledWith(
        companyData,
        createdUser,
      );
      expect(usersService.save).toHaveBeenCalledWith({
        ...createdUser,
        companies: [createdCompany],
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('validateToken', () => {
    it('should return company when token is valid', async () => {
      const token = 'valid-token';

      companiesService.findByToken.mockResolvedValue(mockCompany);

      const result = await service.validateToken(token);

      expect(companiesService.findByToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockCompany);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const token = 'invalid-token';

      companiesService.findByToken.mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(companiesService.findByToken).toHaveBeenCalledWith(token);
    });
  });
});
