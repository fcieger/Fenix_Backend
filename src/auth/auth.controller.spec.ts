import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUserData: CreateUserDto = {
    email: 'test@example.com',
    name: 'Test User',
    phone: '123456789',
    password: 'password123',
  };

  const mockCompanyData: CreateCompanyDto = {
    name: 'Test Company',
    cnpj: '12345678000195',
  };

  const mockLoginResponse = {
    access_token: 'jwt-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      phone: '123456789',
      companies: [],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user and company', async () => {
      authService.register.mockResolvedValue(mockLoginResponse);

      const result = await controller.register(mockUserData, mockCompanyData);

      expect(authService.register).toHaveBeenCalledWith(
        mockUserData,
        mockCompanyData,
      );
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const mockRequest = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          phone: '123456789',
          companies: [],
        },
      };

      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockRequest = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          phone: '123456789',
          companies: [],
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('validateToken', () => {
    it('should validate token', async () => {
      const token = 'valid-token';
      const mockCompany = {
        id: '1',
        name: 'Test Company',
        cnpj: '12345678000195',
        token: 'valid-token',
      };

      authService.validateToken.mockResolvedValue(mockCompany);

      const result = await controller.validateToken(token);

      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockCompany);
    });
  });
});
