const { DataSource } = require('typeorm');
const { User } = require('./dist/users/entities/user.entity.js');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'fenix_db',
  entities: [User],
  synchronize: true,
});

async function checkUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');
    
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    
    console.log(`📊 Total de usuários: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkUsers();





