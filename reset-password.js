const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    // Senha padrão para teste
    const newPassword = '123456';
    
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔐 Nova senha criptografada gerada:');
    console.log('Senha original:', newPassword);
    console.log('Hash gerado:', hashedPassword);
    
    console.log('\n📋 Para aplicar no banco de dados, execute:');
    console.log(`docker exec fenix-db-1 psql -U postgres -d fenix -c "UPDATE users SET password = '${hashedPassword}', \"updatedAt\" = NOW() WHERE email = 'fabio@ieger.com.br';"`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

resetPassword();



