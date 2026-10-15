import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin, hanyaRole } from '../middleware/auth.js';

const router = Router();
router.use(wajibLogin);

// semua role boleh membaca (dipakai dropdown lokasi di form pelapor)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ruangan ORDER BY gedung, lantai, nm_ruang');
    res.json(rows);
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengambil data' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ruangan WHERE id_ruangan = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengambil data' }); }
});

// hanya admin yang boleh mengubah master data
router.post('/', hanyaRole('admin'), async (req, res) => {
  const { nm_ruang, gedung, lantai } = req.body;
  if (!nm_ruang || !gedung || !lantai) {
    return res.status(400).json({ pesan: 'nm_ruang, gedung, dan lantai wajib diisi' });
  }
  try {
    const [h] = await pool.query(
      'INSERT INTO ruangan (nm_ruang, gedung, lantai) VALUES (?, ?, ?)', [nm_ruang, gedung, lantai]
    );
    res.status(201).json({ id_ruangan: h.insertId, nm_ruang, gedung, lantai });
  } catch (e) { res.status(500).json({ pesan: 'Gagal menyimpan data' }); }
});

router.put('/:id', hanyaRole('admin'), async (req, res) => {
  const { nm_ruang, gedung, lantai } = req.body;
  if (!nm_ruang || !gedung || !lantai) {
    return res.status(400).json({ pesan: 'nm_ruang, gedung, dan lantai wajib diisi' });
  }
  try {
    const [h] = await pool.query(
      'UPDATE ruangan SET nm_ruang = ?, gedung = ?, lantai = ? WHERE id_ruangan = ?',
      [nm_ruang, gedung, lantai, req.params.id]
    );
    if (h.affectedRows === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.json({ id_ruangan: Number(req.params.id), nm_ruang, gedung, lantai });
  } catch (e) { res.status(500).json({ pesan: 'Gagal mengubah data' }); }
});

router.delete('/:id', hanyaRole('admin'), async (req, res) => {
  try {
    const [h] = await pool.query('DELETE FROM ruangan WHERE id_ruangan = ?', [req.params.id]);
    if (h.affectedRows === 0) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ pesan: 'Ruangan masih dipakai oleh tiket, tidak dapat dihapus' });
    }
    res.status(500).json({ pesan: 'Gagal menghapus data' });
  }
});

export default router;
