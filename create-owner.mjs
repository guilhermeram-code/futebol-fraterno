import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const hashedPassword = await bcrypt.hash('1754gr', 10);

await connection.execute(`
  INSERT INTO admin_users (username, password, name, isOwner, active, createdAt, lastLogin)
  VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE password = VALUES(password), isOwner = VALUES(isOwner)
`, ['guilhermeram@gmail.com', hashedPassword, 'Guilherme Ramos', true, true]);

console.log('✅ Admin owner criado: guilhermeram@gmail.com / 1754gr');

await connection.end();
