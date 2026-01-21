import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Verificar jogadores órfãos
const [orphans] = await conn.execute(`
  SELECT p.id, p.name, p.teamId 
  FROM players p 
  LEFT JOIN teams t ON p.teamId = t.id 
  WHERE t.id IS NULL
`);
console.log('Jogadores órfãos:', orphans.length);
if (orphans.length > 0) {
  console.log(orphans);
}

// Deletar jogadores órfãos
if (orphans.length > 0) {
  const ids = orphans.map(o => o.id).join(',');
  await conn.execute(`DELETE FROM players WHERE id IN (${ids})`);
  console.log('Jogadores órfãos deletados:', orphans.length);
}

await conn.end();
