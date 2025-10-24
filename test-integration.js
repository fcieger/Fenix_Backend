const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const JAVA_SERVICE_URL = 'http://localhost:3002';

async function testIntegration() {
  console.log('🧪 Testando integração completa...\n');

  // 1. Testar se o backend NestJS está rodando
  console.log('1️⃣ Testando backend NestJS...');
  try {
    const response = await fetch(`${BASE_URL}/api/certificado/test`);
    const data = await response.json();
    console.log('✅ Backend NestJS:', data.message);
  } catch (error) {
    console.log('❌ Backend NestJS não está rodando:', error.message);
    return;
  }

  // 2. Testar se o serviço Java está rodando
  console.log('\n2️⃣ Testando serviço Java...');
  try {
    const response = await fetch(`${JAVA_SERVICE_URL}/api/java-certificado/test`);
    const data = await response.text();
    console.log('✅ Serviço Java:', data);
  } catch (error) {
    console.log('❌ Serviço Java não está rodando:', error.message);
    console.log('   Execute: cd /home/fabio/projetos/fenix-certificado-service && ./start-auto.sh');
    return;
  }

  // 3. Testar integração NestJS -> Java
  console.log('\n3️⃣ Testando integração NestJS -> Java...');
  try {
    const response = await fetch(`${BASE_URL}/api/certificado/test-java`);
    const data = await response.json();
    console.log('✅ Integração:', data.message);
    console.log('   Java Service Available:', data.javaServiceAvailable);
  } catch (error) {
    console.log('❌ Erro na integração:', error.message);
  }

  // 4. Testar validação de certificado (simulado)
  console.log('\n4️⃣ Testando validação de certificado...');
  try {
    // Criar um arquivo de teste simulado
    const testFile = Buffer.from('test-certificate-data');
    const formData = new FormData();
    const blob = new Blob([testFile], { type: 'application/x-pkcs12' });
    formData.append('arquivo', blob, 'test.pfx');
    formData.append('senha', 'test123');

    const response = await fetch(`${JAVA_SERVICE_URL}/api/java-certificado/validar`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Validação Java:', 'Certificado processado');
      console.log('   Nome:', data.nome);
      console.log('   CNPJ:', data.cnpj);
    } else {
      console.log('⚠️  Validação Java falhou (esperado para arquivo de teste)');
    }
  } catch (error) {
    console.log('⚠️  Erro na validação (esperado para arquivo de teste):', error.message);
  }

  console.log('\n🎉 Teste de integração concluído!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Inicie o serviço Java: cd /home/fabio/projetos/fenix-certificado-service && ./start-auto.sh');
  console.log('2. Teste o upload de um certificado real no frontend');
  console.log('3. Verifique os logs do NestJS para confirmar a integração');
}

testIntegration().catch(console.error);















