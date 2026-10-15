import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin, hanyaRole } from '../middleware/auth.js';

const router = Router();
router.use(wajibLogin);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fasilitas ORDER BY kategori, nm_fasilitas');
    res.json(rows);
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengambil data' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fasilitas WHERE id_fasilitas = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengambil data' }); }
});

router.post('/', hanyaRole('admin'), async (req, res) => {
  const { nm_fasilitas, kategori, kondisi } = req.body;
  if (!nm_fasilitas || !kategori) {
    return res.status(400).json({ pesan: 'nm_fasilitas dan kategori wajib diisi' });
  }
  try {
    const [h] = await pool.query(
      'INSERT INTO fasilitas (nm_fasilitas, kategori, kondisi) VALUES (?, ?, ?)',
      [nm_fasilitas, kategori, kondisi ?? 'baik']
    );
    res.status(201).json({ id_fasilitas: h.insertId, nm_fasilitas, kategori, kondisi: kondisi ?? 'baik' });
  } catch (e) { res.status(500).json({ pesan: 'Gagal menyimpan data' }); }
});

router.put('/:id', hanyaRole('admin'), async (req, res) => {
  const { nm_fasilitas, kategori, kondisi } = req.body;
  if (!nm_fasilitas || !kategori || !kondisi) {
    return res.status(400).json({ pesan: 'nm_fasilitas, kategori, dan kondisi wajib diisi' });
  }
  try {
    const [h] = await pool.query(
      'UPDATE fasilitas SET nm_fasilitas = ?, kategori = ?, kondisi = ? WHERE id_fasilitas = ?',
      [nm_fasilitas, kategori, kondisi, req.params.id]
    );
    if (h.affectedRows === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.json({ id_fasilitas: Number(req.params.id), nm_fasilitas, kategori, kondisi });
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengubah data' }); }
});

router.delete('/:id', hanyaRole('admin'), async (req, res) => {
  try {
    const [h] = await pool.query('DELETE FROM fasilitas WHERE id_fasilitas = ?', [req.params.id]);
    if (h.affectedRows === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ pesan: 'Fasilitas masih dipakai oleh tiket; ubah kondisinya saja' });
    }
    res.status(500).json({ pesan: 'Gagal menghapus data' });
  }
});

export default router;
