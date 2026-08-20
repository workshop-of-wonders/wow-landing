// Genera el hash bcrypt de la contraseña de admin para pegar en la variable
// de entorno ADMIN_PASSWORD_HASH de Vercel. La contraseña en texto plano
// nunca se guarda en ningún archivo del repo.
//
// Uso: node scripts/hash-password.mjs "tu-contraseña-aquí"

import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "tu-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
console.log('Copia ese valor completo (incluye "$2a$..." o "$2b$...") en la variable');
console.log('de entorno ADMIN_PASSWORD_HASH del proyecto en Vercel.');
