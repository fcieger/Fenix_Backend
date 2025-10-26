import 'reflect-metadata';

// Mock do TypeORM para testes
jest.mock(
  'typeorm',
  (): jest.Mocked<typeof import('typeorm')> => ({
    ...jest.requireActual('typeorm'),
    getRepository: jest.fn(),
    getConnection: jest.fn(),
  }),
);

// Mock do bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock do JWT
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn(),
  })),
}));

// Configuração global de timeout para testes
jest.setTimeout(30000);
