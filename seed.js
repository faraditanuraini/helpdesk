// npm run seed : membuat 3 akun contoh dengan password ter-hash (password: password123)
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const hash = await bcrypt.hash('password123', 10);
const akun = [
  ['Admin Sarpras', 'admin@saintek.ac.id', '081111111111', 'admin'],
  ['Teknisi Budi', 'budi@saintek.ac.id', '082222222222', 'teknisi'],
  ['Faradita', 'faradita@student.uinsby.ac.id', '083333333333', 'pelapor'],
];
for (const [nama, email, hp, role] of akun) {
  await pool.query(
    'INSERT IGNORE INTO pengguna (nama, email, password_hash, no_hp, role) VALUES (?, ?, ?, ?, ?)',
    [nama, email, hash, hp, role]
  );
}
console.log('Seed selesai');
process.exit(0);
