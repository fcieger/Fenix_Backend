const { DataSource } = require('typeorm');
const { Produto } = require('./dist/produtos/entities/produto.entity.js');
const { Company } = require('./dist/companies/entities/company.entity.js');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'fenix_user',
  password: 'fenix_password',
  database: 'fenix_db',
  entities: [Produto, Company],
  synchronize: true,
});

async function createTestProduct() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');
    
    const produtoRepository = AppDataSource.getRepository(Produto);
    
    // Criar produto de teste
    const produto = produtoRepository.create({
      nome: 'Produto Teste',
      sku: 'TEST001',
      preco: 100.00,
      unidadeMedida: 'UN',
      ativo: true,
      companyId: '2c650c76-4e2a-4b58-933c-c3f8b7434d80' // ID da empresa que aparece nos logs
    });
    
    const savedProduto = await produtoRepository.save(produto);
    console.log('✅ Produto criado:', savedProduto);
    
    // Verificar quantos produtos existem
    const count = await produtoRepository.count();
    console.log(`📊 Total de produtos no banco: ${count}`);
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createTestProduct();
