const { DataSource } = require('typeorm');

// Se DATABASE_URL estiver definida, usar ela; caso contrário, usar variáveis individuais
const getDataSourceConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
      logging: true,
    };
  }
  
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: String(process.env.DB_PASSWORD || 'fenix123'),
    database: process.env.DB_DATABASE || 'fenix',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: true,
  };
};

module.exports = new DataSource(getDataSourceConfig());


























