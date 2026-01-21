import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, matchDate FROM matches WHERE matchDate IS NOT NULL ORDER BY id DESC LIMIT 5');
console.log('Matches with dates:');
rows.forEach(row => {
  console.log(`ID: ${row.id}, matchDate: ${row.matchDate}, ISO: ${row.matchDate?.toISOString?.() || 'N/A'}`);
});
await conn.end();
