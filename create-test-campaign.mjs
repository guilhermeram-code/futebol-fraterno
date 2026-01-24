import { getDb } from './server/db.js';
import { campaigns, adminUsers } from './drizzle/schema.js';
import { hashPassword } from './server/_core/password.js';

const db = await getDb();
if (!db) {
  console.log('Database not available');
  process.exit(1);
}

// Criar campanha
const [campaign] = await db.insert(campaigns).values({
  name: 'Teste Guilherme',
  slug: 'teste-guilherme',
  subtitle: '2026 - Teste de Autenticação',
  organizerName: 'Guilherme Ramos',
  active: true,
  createdAt: new Date(),
}).returning();

console.log('✅ Campanha criada:', campaign);

// Criar admin user com senha inicial "senha123"
const passwordHash = await hashPassword('senha123');

const [admin] = await db.insert(adminUsers).values({
  campaignId: campaign.id,
  username: 'guilherme.ramos@constrixengenharia.com.br',
  name: 'Guilherme Ramos',
  passwordHash: passwordHash,
  isOwner: true,
  active: true,
  createdAt: new Date(),
}).returning();

console.log('✅ Admin criado:', { id: admin.id, username: admin.username, name: admin.name });
console.log('\n📋 CREDENCIAIS:');
console.log('URL: https://peladapro.com.br/teste-guilherme/admin/login');
console.log('Email:', admin.username);
console.log('Senha inicial: senha123');
console.log('\n🔐 Para testar recuperação de senha:');
console.log('1. Acesse: https://peladapro.com.br/teste-guilherme/admin/login');
console.log('2. Clique em "Esqueci minha senha"');
console.log('3. Digite:', admin.username);
console.log('4. Verifique seu email e use a senha temporária');

process.exit(0);
