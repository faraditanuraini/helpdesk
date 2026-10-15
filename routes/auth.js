import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';

const router = Router();

// POST /auth/register  (hanya membuat akun pelapor)
router.post('/register', async (req, res) => {
  const { nama, email, password, no_hp } = req.body;
  if (!nama || !email || !password) {
    return res.status(400).json({ pesan: 'nama, email, dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ pesan: 'password minimal 6 karakter' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [hasil] = await pool.query(
      "INSERT INTO pengguna (nama, email, password_hash, no_hp, role) VALUES (?, ?, ?, ?, 'pelapor')",
      [nama, email, hash, no_hp ?? null]
    );
    res.status(201).json({ id_pengguna: hasil.insertId, nama, email, role: 'pelapor' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ pesan: 'Email sudah terdaftar' });
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mendaftar' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ pesan: 'email dan password wajib diisi' });
  try {
    const [rows] = await pool.query('SELECT * FROM pengguna WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ pesan: 'Email atau password salah' });
    }
    const token = jwt.sign({ id: user.id_pengguna, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id_pengguna: user.id_pengguna, nama: user.nama, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal login' });
  }
});

// GET /auth/me
router.get('/me', wajibLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_pengguna, nama, email, no_hp, role FROM pengguna WHERE id_pengguna = ?', [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ pesan: 'Pengguna tidak ditemukan' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

// GET /auth/teknisi  (admin memilih teknisi saat menugaskan)
router.get('/teknisi', wajibLogin, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ pesan: 'Akses ditolak untuk peran Anda' });
  try {
    const [rows] = await pool.query("SELECT id_pengguna, nama, no_hp FROM pengguna WHERE role = 'teknisi'");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

export default router;
