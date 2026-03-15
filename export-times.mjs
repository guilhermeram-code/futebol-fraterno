import { createConnection } from "mysql2/promise";
import { writeFileSync } from "fs";

// Usar a mesma DATABASE_URL que o projeto usa
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL não definida");
  process.exit(1);
}

const conn = await createConnection(dbUrl);

const [rows] = await conn.execute(`
  SELECT 
    t.name AS time_nome,
    t.lodge AS time_loja,
    p.name AS jogador_nome,
    p.position AS posicao,
    p.number AS numero
  FROM teams t
  LEFT JOIN players p ON p.teamId = t.id
  WHERE t.campaignId = (SELECT id FROM campaigns WHERE slug = 'futebolfraterno2026')
  ORDER BY t.name, p.name
`);

writeFileSync("/home/ubuntu/times_jogadores.json", JSON.stringify(rows, null, 2));
console.log(`Exportado: ${rows.length} linhas`);

await conn.end();
