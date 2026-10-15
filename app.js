import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import ruanganRoutes from './routes/ruangan.js';
import fasilitasRoutes from './routes/fasilitas.js';
import tiketRoutes from './routes/tiket.js';
import rekapRoutes from './routes/rekap.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.send('API SaintekCare berjalan'));
app.use('/auth', authRoutes);
app.use('/ruangan', ruanganRoutes);
app.use('/fasilitas', fasilitasRoutes);
app.use('/tiket', tiketRoutes);
app.use('/rekap', rekapRoutes);

// handler error terakhir (termasuk error multer)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 400).json({ pesan: err.message || 'Terjadi kesalahan' });
});

export default app;
