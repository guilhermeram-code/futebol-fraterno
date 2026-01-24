// Teste da lógica do login master
const MASTER_USERNAME = process.env.OWNER_NAME || 'guilhermeram@gmail.com';
const MASTER_PASSWORD = 'Peyb+029';

const testUsername = 'guilhermeram@gmail.com';
const testPassword = 'Peyb+029';

console.log('=== TESTE DE LOGIN MASTER ===');
console.log('MASTER_USERNAME:', MASTER_USERNAME);
console.log('MASTER_PASSWORD:', MASTER_PASSWORD);
console.log('testUsername:', testUsername);
console.log('testPassword:', testPassword);
console.log('');
console.log('Username match:', testUsername === MASTER_USERNAME);
console.log('Password match:', testPassword === MASTER_PASSWORD);
console.log('Both match:', testUsername === MASTER_USERNAME && testPassword === MASTER_PASSWORD);
console.log('');
console.log('OWNER_NAME env:', process.env.OWNER_NAME);
console.log('');

// Teste com bytes
console.log('Username bytes:', Buffer.from(testUsername).toString('hex'));
console.log('Master bytes:', Buffer.from(MASTER_USERNAME).toString('hex'));
console.log('Password bytes:', Buffer.from(testPassword).toString('hex'));
console.log('Master pass bytes:', Buffer.from(MASTER_PASSWORD).toString('hex'));
