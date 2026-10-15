import { Router } from 'express';
import fs from 'fs';
import { pool } from '../db.js';
import { wajibLogin, hanyaRole } from '../middleware/auth.js';
import { uploadFoto } from '../middleware/upload.js';

const router = Router();
router.use(wajibLogin);

const SELECT_TIKET = `
  SELECT t.id_tiket, t.id_pengguna, t.judul, t.deskripsi, t.foto_url, t.status, t.tgl_lapor, t.tgl_update,
         p.nama AS pelapor, r.nm_ruang, r.gedung, r.lantai,
         f.nm_fasilitas, f.kategori,
         pg.id_teknisi, tk.nama AS teknisi
  FROM tiket t
  JOIN pengguna p   ON t.id_pengguna = p.id_pengguna
  JOIN ruangan r    ON t.id_ruangan = r.id_ruangan
  JOIN fasilitas f  ON t.id_fasilitas = f.id_fasilitas
  LEFT JOIN penugasan pg ON pg.id_tiket = t.id_tiket
  LEFT JOIN pengguna tk  ON pg.id_teknisi = tk.id_pengguna`;

// mencatat satu baris linimasa; dipakai di dalam transaksi
const catat = (conn, id_tiket, status, keterangan) =>
  conn.query('INSERT INTO timeline (id_tiket, status, keterangan) VALUES (?, ?, ?)', [id_tiket, status, keterangan]);

const bolehLihat = (t, u) =>
  u.role === 'admin' ||
  (u.role === 'pelapor' && t.id_pengguna === u.id) ||
  (u.role === 'teknisi' && t.id_teknisi === u.id);

// ---------- POST /tiket : pelapor membuat tiket (US-02, US-03) ----------
router.post('/', hanyaRole('pelapor'), uploadFoto.single('foto'), async (req, res) => {
  const hapusFoto = () => req.file && fs.unlink(req.file.path, () => {});
  const { id_ruangan, id_fasilitas, judul, deskripsi } = req.body;

  if (!req.file) return res.status(400).json({ pesan: 'Foto bukti wajib dilampirkan' });
  if (!id_ruangan || !id_fasilitas || !judul || !deskripsi) {
    hapusFoto();
    return res.status(400).json({ pesan: 'id_ruangan, id_fasilitas, judul, dan deskripsi wajib diisi' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [h] = await conn.query(
      `INSERT INTO tiket (id_pengguna, id_ruangan, id_fasilitas, judul, deskripsi, foto_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, id_ruangan, id_fasilitas, judul, deskripsi, `/uploads/${req.file.filename}`]
    );
    await catat(conn, h.insertId, 'submitted', 'Tiket diajukan oleh pelapor');
    await conn.commit();
    res.status(201).json({ id_tiket: h.insertId, status: 'submitted', pesan: 'Pengaduan Berhasil Dikirim' });
  } catch (e) {
    await conn.rollback();
    hapusFoto();
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ pesan: 'Ruangan atau fasilitas tidak ditemukan' });
    }
    console.error(e);
    res.status(500).json({ pesan: 'Gagal menyimpan tiket' });
  } finally {
    conn.release();
  }
});

// ---------- GET /tiket : daftar sesuai peran (US-06, US-08) ----------
// pelapor: miliknya | teknisi: yang ditugaskan kepadanya | admin: semua (+ filter)
router.get('/', async (req, res) => {
  const kondisi = [];
  const nilai = [];
  if (req.user.role === 'pelapor') { kondisi.push('t.id_pengguna = ?'); nilai.push(req.user.id); }
  if (req.user.role === 'teknisi') { kondisi.push('pg.id_teknisi = ?'); nilai.push(req.user.id); }
  const { status, kategori, dari, sampai } = req.query;
  if (status)   { kondisi.push('t.status = ?');           nilai.push(status); }
  if (kategori) { kondisi.push('f.kategori = ?');         nilai.push(kategori); }
  if (dari)     { kondisi.push('DATE(t.tgl_lapor) >= ?'); nilai.push(dari); }
  if (sampai)   { kondisi.push('DATE(t.tgl_lapor) <= ?'); nilai.push(sampai); }
  const where = kondisi.length ? `WHERE ${kondisi.join(' AND ')}` : '';
  try {
    const [rows] = await pool.query(`${SELECT_TIKET} ${where} ORDER BY t.tgl_lapor DESC`, nilai);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

// ---------- GET /tiket/:id : detail + linimasa + rating (US-04) ----------
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`${SELECT_TIKET} WHERE t.id_tiket = ?`, [req.params.id]);
    const tiket = rows[0];
    if (!tiket) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    if (!bolehLihat(tiket, req.user)) return res.status(403).json({ pesan: 'Akses ditolak untuk peran Anda' });

    const [timeline] = await pool.query(
      'SELECT status, keterangan, waktu_update FROM timeline WHERE id_tiket = ? ORDER BY waktu_update, id_timeline',
      [req.params.id]
    );
    const [rating] = await pool.query('SELECT nilai, ulasan, tgl FROM rating WHERE id_tiket = ?', [req.params.id]);
    res.json({ ...tiket, timeline, rating: rating[0] ?? null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

// ---------- POST /tiket/:id/tugaskan : admin menugaskan teknisi (US-11) ----------
router.post('/:id/tugaskan', hanyaRole('admin'), async (req, res) => {
  const { id_teknisi, catatan } = req.body;
  if (!id_teknisi) return res.status(400).json({ pesan: 'Pilih teknisi terlebih dahulu' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[tiket]] = await conn.query('SELECT status FROM tiket WHERE id_tiket = ? FOR UPDATE', [req.params.id]);
    if (!tiket) { await conn.rollback(); return res.status(404).json({ pesan: 'Data tidak ditemukan' }); }
    if (tiket.status !== 'submitted') {
      await conn.rollback();
      return res.status(409).json({ pesan: 'Hanya tiket berstatus submitted yang dapat ditugaskan' });
    }
    const [[tek]] = await conn.query("SELECT nama FROM pengguna WHERE id_pengguna = ? AND role = 'teknisi'", [id_teknisi]);
    if (!tek) { await conn.rollback(); return res.status(400).json({ pesan: 'Teknisi tidak ditemukan' }); }

    await conn.query(
      'INSERT INTO penugasan (id_tiket, id_teknisi, id_admin, catatan) VALUES (?, ?, ?, ?)',
      [req.params.id, id_teknisi, req.user.id, catatan ?? null]
    );
    await conn.query("UPDATE tiket SET status = 'assigned' WHERE id_tiket = ?", [req.params.id]);
    await catat(conn, req.params.id, 'assigned', `Ditugaskan kepada teknisi ${tek.nama}`);
    await conn.commit();
    res.status(201).json({ id_tiket: Number(req.params.id), status: 'assigned', teknisi: tek.nama });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ pesan: 'Gagal menugaskan tiket' });
  } finally {
    conn.release();
  }
});

// ---------- PUT /tiket/:id/status : teknisi memperbarui progres ----------
// alur yang diizinkan: assigned -> in_progress -> resolved
const ALUR = { assigned: 'in_progress', in_progress: 'resolved' };
router.put('/:id/status', hanyaRole('teknisi'), async (req, res) => {
  const { status, keterangan } = req.body;
  if (!status) return res.status(400).json({ pesan: 'status wajib diisi' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT t.status, pg.id_teknisi FROM tiket t
       LEFT JOIN penugasan pg ON pg.id_tiket = t.id_tiket
       WHERE t.id_tiket = ? FOR UPDATE`, [req.params.id]
    );
    const t = rows[0];
    if (!t) { await conn.rollback(); return res.status(404).json({ pesan: 'Data tidak ditemukan' }); }
    if (t.id_teknisi !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ pesan: 'Tiket ini bukan tugas Anda' });
    }
    if (ALUR[t.status] !== status) {
      await conn.rollback();
      return res.status(409).json({ pesan: `Status ${t.status} hanya dapat diubah menjadi ${ALUR[t.status] ?? '(tidak ada)'}` });
    }
    await conn.query('UPDATE tiket SET status = ? WHERE id_tiket = ?', [status, req.params.id]);
    await catat(conn, req.params.id, status, keterangan || (status === 'resolved' ? 'Perbaikan selesai' : 'Sedang dikerjakan'));
    await conn.commit();
    res.json({ id_tiket: Number(req.params.id), status });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ pesan: 'Gagal memperbarui status' });
  } finally {
    conn.release();
  }
});

// ---------- POST /tiket/:id/rating : pelapor menilai (US-10) ----------
router.post('/:id/rating', hanyaRole('pelapor'), async (req, res) => {
  const nilai = Number(req.body.nilai);
  if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
    return res.status(400).json({ pesan: 'nilai harus bilangan bulat 1 sampai 5' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[t]] = await conn.query('SELECT id_pengguna, status FROM tiket WHERE id_tiket = ? FOR UPDATE', [req.params.id]);
    if (!t || t.id_pengguna !== req.user.id) {
      await conn.rollback();
      return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    }
    if (t.status !== 'resolved') {
      await conn.rollback();
      return res.status(409).json({ pesan: 'Rating hanya dapat diberikan pada tiket berstatus resolved' });
    }
    await conn.query('INSERT INTO rating (id_tiket, nilai, ulasan) VALUES (?, ?, ?)',
      [req.params.id, nilai, req.body.ulasan ?? null]);
    await conn.query("UPDATE tiket SET status = 'closed' WHERE id_tiket = ?", [req.params.id]);
    await catat(conn, req.params.id, 'closed', 'Pelapor memberi penilaian, tiket ditutup');
    await conn.commit();
    res.status(201).json({ id_tiket: Number(req.params.id), nilai, status: 'closed' });
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ pesan: 'Tiket ini sudah dinilai' });
    console.error(e);
    res.status(500).json({ pesan: 'Gagal menyimpan rating' });
  } finally {
    conn.release();
  }
});

export default router;
