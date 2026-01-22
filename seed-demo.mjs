import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🚀 Criando campeonato demo "Copa Amigos 2026"...');

// 1. Buscar ID do campeonato
const [campaigns] = await connection.query(
  "SELECT id FROM campaigns WHERE slug = 'copa-amigos-2026'"
);
const campaignId = campaigns[0].id;
console.log(`✅ Campeonato ID: ${campaignId}`);

// 2. Criar grupos
await connection.query(
  "INSERT INTO `groups` (campaignId, name, createdAt) VALUES (?, 'Grupo A', NOW()), (?, 'Grupo B', NOW())",
  [campaignId, campaignId]
);
console.log('✅ Grupos criados');

// 3. Buscar IDs dos grupos
const [groups] = await connection.query(
  "SELECT id, name FROM `groups` WHERE campaignId = ? ORDER BY id",
  [campaignId]
);
const groupAId = groups[0].id;
const groupBId = groups[1].id;

// 4. Criar times
const teams = [
  [campaignId, groupAId, 'Águias FC', 'Águias', '/demo/team1.jpg'],
  [campaignId, groupAId, 'Leões United', 'Leões', '/demo/team2.jpg'],
  [campaignId, groupAId, 'Tigres FC', 'Tigres', '/demo/team3.png'],
  [campaignId, groupAId, 'Falcões SC', 'Falcões', '/demo/team4.jpg'],
  [campaignId, groupBId, 'Lobos FC', 'Lobos', '/demo/team5.jpg'],
  [campaignId, groupBId, 'Panteras United', 'Panteras', '/demo/team6.png'],
  [campaignId, groupBId, 'Tubarões SC', 'Tubarões', '/demo/team7.png'],
  [campaignId, groupBId, 'Dragões FC', 'Dragões', '/demo/team8.png'],
];

for (const team of teams) {
  await connection.query(
    "INSERT INTO teams (campaignId, groupId, name, lodge, logoUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    team
  );
}
console.log('✅ 8 times criados');

// 5. Buscar IDs dos times
const [teamsList] = await connection.query(
  "SELECT id, name FROM teams WHERE campaignId = ? ORDER BY id",
  [campaignId]
);

// 6. Criar jogadores (3 por time)
const players = [
  // Águias FC
  [campaignId, teamsList[0].id, 'Carlos Silva', 10, 'Atacante'],
  [campaignId, teamsList[0].id, 'Pedro Santos', 7, 'Meio-campo'],
  [campaignId, teamsList[0].id, 'João Costa', 1, 'Goleiro'],
  // Leões United
  [campaignId, teamsList[1].id, 'Rafael Oliveira', 9, 'Atacante'],
  [campaignId, teamsList[1].id, 'Lucas Ferreira', 8, 'Meio-campo'],
  [campaignId, teamsList[1].id, 'Marcos Lima', 1, 'Goleiro'],
  // Tigres FC
  [campaignId, teamsList[2].id, 'Bruno Alves', 11, 'Atacante'],
  [campaignId, teamsList[2].id, 'Diego Rocha', 6, 'Zagueiro'],
  [campaignId, teamsList[2].id, 'Thiago Souza', 1, 'Goleiro'],
  // Falcões SC
  [campaignId, teamsList[3].id, 'Gabriel Martins', 10, 'Atacante'],
  [campaignId, teamsList[3].id, 'Felipe Ribeiro', 5, 'Zagueiro'],
  [campaignId, teamsList[3].id, 'André Carvalho', 1, 'Goleiro'],
  // Lobos FC
  [campaignId, teamsList[4].id, 'Ricardo Gomes', 9, 'Atacante'],
  [campaignId, teamsList[4].id, 'Rodrigo Dias', 8, 'Meio-campo'],
  [campaignId, teamsList[4].id, 'Paulo Mendes', 1, 'Goleiro'],
  // Panteras United
  [campaignId, teamsList[5].id, 'Fernando Castro', 7, 'Atacante'],
  [campaignId, teamsList[5].id, 'Gustavo Pinto', 4, 'Zagueiro'],
  [campaignId, teamsList[5].id, 'Leonardo Nunes', 1, 'Goleiro'],
  // Tubarões SC
  [campaignId, teamsList[6].id, 'Vinícius Barros', 11, 'Atacante'],
  [campaignId, teamsList[6].id, 'Matheus Correia', 3, 'Zagueiro'],
  [campaignId, teamsList[6].id, 'Daniel Moreira', 1, 'Goleiro'],
  // Dragões FC
  [campaignId, teamsList[7].id, 'Alexandre Teixeira', 10, 'Atacante'],
  [campaignId, teamsList[7].id, 'Renato Azevedo', 2, 'Lateral'],
  [campaignId, teamsList[7].id, 'Fábio Monteiro', 1, 'Goleiro'],
];

for (const player of players) {
  await connection.query(
    "INSERT INTO players (campaignId, teamId, name, number, position, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    player
  );
}
console.log('✅ 24 jogadores criados');

// 7. Criar jogos
const matches = [
  // Grupo A
  [campaignId, groupAId, teamsList[0].id, teamsList[1].id, 3, 2, 'DATE_SUB(NOW(), INTERVAL 15 DAY)', 'Campo Central', 1],
  [campaignId, groupAId, teamsList[2].id, teamsList[3].id, 1, 1, 'DATE_SUB(NOW(), INTERVAL 15 DAY)', 'Campo Central', 1],
  [campaignId, groupAId, teamsList[0].id, teamsList[2].id, 2, 0, 'DATE_SUB(NOW(), INTERVAL 10 DAY)', 'Campo Central', 2],
  [campaignId, groupAId, teamsList[1].id, teamsList[3].id, 4, 1, 'DATE_SUB(NOW(), INTERVAL 10 DAY)', 'Campo Central', 2],
  [campaignId, groupAId, teamsList[0].id, teamsList[3].id, 2, 2, 'DATE_SUB(NOW(), INTERVAL 5 DAY)', 'Campo Central', 3],
  [campaignId, groupAId, teamsList[1].id, teamsList[2].id, 3, 1, 'DATE_SUB(NOW(), INTERVAL 5 DAY)', 'Campo Central', 3],
  // Grupo B
  [campaignId, groupBId, teamsList[4].id, teamsList[5].id, 2, 1, 'DATE_SUB(NOW(), INTERVAL 15 DAY)', 'Campo Sul', 1],
  [campaignId, groupBId, teamsList[6].id, teamsList[7].id, 0, 3, 'DATE_SUB(NOW(), INTERVAL 15 DAY)', 'Campo Sul', 1],
  [campaignId, groupBId, teamsList[4].id, teamsList[6].id, 1, 1, 'DATE_SUB(NOW(), INTERVAL 10 DAY)', 'Campo Sul', 2],
  [campaignId, groupBId, teamsList[5].id, teamsList[7].id, 2, 2, 'DATE_SUB(NOW(), INTERVAL 10 DAY)', 'Campo Sul', 2],
  [campaignId, groupBId, teamsList[4].id, teamsList[7].id, 3, 0, 'DATE_SUB(NOW(), INTERVAL 5 DAY)', 'Campo Sul', 3],
  [campaignId, groupBId, teamsList[5].id, teamsList[6].id, 1, 0, 'DATE_SUB(NOW(), INTERVAL 5 DAY)', 'Campo Sul', 3],
];

for (const match of matches) {
  await connection.query(
    `INSERT INTO matches (campaignId, groupId, homeTeamId, awayTeamId, homeScore, awayScore, matchDate, location, round, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ${match[6]}, ?, ?, NOW(), NOW())`,
    [match[0], match[1], match[2], match[3], match[4], match[5], match[7], match[8]]
  );
}
console.log('✅ 12 jogos criados');

// 8. Adicionar fotos
const photos = [
  [campaignId, '/demo/photo1.jpg', 'Disputa acirrada pela bola no meio de campo'],
  [campaignId, '/demo/photo2.jpg', 'Comemoração do gol da vitória'],
  [campaignId, '/demo/photo3.jpg', 'Time comemorando a classificação'],
  [campaignId, '/demo/photo4.jpg', 'Foto oficial do time campeão'],
];

for (const photo of photos) {
  await connection.query(
    "INSERT INTO photos (campaignId, imageUrl, caption, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
    photo
  );
}
console.log('✅ 4 fotos adicionadas');

// 9. Adicionar patrocinadores
const sponsors = [
  [campaignId, 'Fly Emirates', '/demo/sponsor1.png', 'https://www.emirates.com', 1],
  [campaignId, 'Penalty', '/demo/sponsor2.jpg', 'https://www.penalty.com.br', 2],
  [campaignId, 'Esportes da Sorte', '/demo/sponsor3.jpg', 'https://www.esportesdasorte.com', 3],
];

for (const sponsor of sponsors) {
  await connection.query(
    "INSERT INTO sponsors (campaignId, name, logoUrl, websiteUrl, `order`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    sponsor
  );
}
console.log('✅ 3 patrocinadores adicionados');

// 10. Adicionar comentários
const comments = [
  [campaignId, 'João Torcedor', 'Que campeonato incrível! Os jogos estão muito disputados!'],
  [campaignId, 'Maria Silva', 'Parabéns pela organização! Site ficou top demais!'],
  [campaignId, 'Pedro Souza', 'Águias FC jogando muito! Favoritos ao título!'],
  [campaignId, 'Ana Costa', 'Rafael Oliveira está imparável! Artilheiro disparado!'],
];

for (const comment of comments) {
  await connection.query(
    "INSERT INTO comments (campaignId, authorName, content, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
    comment
  );
}
console.log('✅ 4 comentários adicionados');

// 11. Adicionar aviso
await connection.query(
  "INSERT INTO announcements (campaignId, title, content, isActive, createdAt, updatedAt) VALUES (?, 'Semifinais definidas!', 'As chaves do mata-mata já estão disponíveis. Confira os confrontos!', 1, NOW(), NOW())",
  [campaignId]
);
console.log('✅ Aviso adicionado');

await connection.end();

console.log('\n🎉 Campeonato "Copa Amigos 2026" criado com sucesso!');
console.log(`🔗 Acesse: https://peladapro.com.br/copa-amigos-2026`);
