import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Usar fetch para chamar a API do servidor local
const BASE_URL = 'http://localhost:3000';

async function createTestTrial() {
  const email = 'contato@meucontomagico.com.br';
  
  console.log(`\n🧪 Criando trial de teste para: ${email}`);
  console.log('━'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/trpc/trial.signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { email }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Erro:', data.error.json?.message || JSON.stringify(data.error));
      return;
    }

    const result = data.result?.data?.json;
    console.log('✅ Trial criado com sucesso!');
    console.log('📧 Email enviado para:', email);
    console.log('🔗 Slug do campeonato:', result?.campaignSlug);
    console.log('🆔 Campaign ID:', result?.campaignId);
    console.log('\n📬 Verifique a caixa de entrada de contato@meucontomagico.com.br');
    
  } catch (error) {
    console.error('❌ Erro ao criar trial:', error.message);
  }
}

createTestTrial();
