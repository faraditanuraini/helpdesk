import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin, hanyaRole } from '../middleware/auth.js';

const router = Router();
router.use(wajibLogin, hanyaRole('admin'));

// susun filter tanggal secara aman (nilai tetap lewat tanda tanya)
function filterTanggal(q) {
  const kondisi = [];
  const nilai = [];
  if (q.dari)   { kondisi.push('DATE(t.tgl_lapor) >= ?'); nilai.push(q.dari); }
  if (q.sampai) { kondisi.push('DATE(t.tgl_lapor) <= ?'); nilai.push(q.sampai); }
  return { where: kondisi.length ? `WHERE ${kondisi.join(' AND ')}` : '', nilai };
}

// GET /rekap/ringkasan?dari=2026-09-01&sampai=2026-09-30  (US-06)
router.get('/ringkasan', async (req, res) => {
  const { where, nilai } = filterTanggal(req.query);
  try {
    const [perStatus] = await pool.query(
      `SELECT t.status, COUNT(*) AS jumlah FROM tiket t ${where} GROUP BY t.status`, nilai);
    const [[total]] = await pool.query(`SELECT COUNT(*) AS total FROM tiket t ${where}`, nilai);
    const [[rata]] = await pool.query(
      `SELECT ROUND(AVG(r.nilai), 2) AS rata_rata_rating, COUNT(r.id_rating) AS jumlah_rating
       FROM tiket t JOIN rating r ON r.id_tiket = t.id_tiket ${where}`, nilai);
    res.json({ total: total.total, per_status: perStatus, ...rata });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil rekap' });
  }
});

// GET /rekap/terbanyak  (US-09) : fasilitas dan ruangan paling sering dilaporkan
router.get('/terbanyak', async (req, res) => {
  const { where, nilai } = filterTanggal(req.query);
  try {
    const [fasilitas] = await pool.query(
      `SELECT f.nm_fasilitas, f.kategori, COUNT(t.id_tiket) AS jumlah
       FROM tiket t JOIN fasilitas f ON t.id_fasilitas = f.id_fasilitas ${where}
       GROUP BY f.id_fasilitas, f.nm_fasilitas, f.kategori ORDER BY jumlah DESC LIMIT 10`, nilai);
    const [ruangan] = await pool.query(
      `SELECT r.nm_ruang, r.gedung, COUNT(t.id_tiket) AS jumlah
       FROM tiket t JOIN ruangan r ON t.id_ruangan = r.id_ruangan ${where}
       GROUP BY r.id_ruangan, r.nm_ruang, r.gedung ORDER BY jumlah DESC LIMIT 10`, nilai);
    res.json({ fasilitas, ruangan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil rekap' });
  }
});

export default router;
