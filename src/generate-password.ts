/* eslint-disable @typescript-eslint/no-floating-promises */
import * as bcrypt from 'bcrypt';

async function generarHash() {
  const password = 'Temporal1!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generarHash();
