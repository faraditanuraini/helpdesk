# api-helpdesk 

Backend Express + MySQL untuk aplikasi helpdesk fasilitas Fakultas Sains dan Teknologi.

## Menjalankan dari nol
1. Nyalakan MySQL (XAMPP), lalu impor `skema.sql` lewat phpMyAdmin (tab Import) atau `mysql -u root -p < skema.sql`.
2. `npm install`
3. Salin `.env.example` menjadi `.env`, isi nilainya (XAMPP: `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=` kosong, `DB_NAME=db_helpdesk`, `JWT_SECRET=<teks acak panjang>`, `PORT=3000`).
4. `npm run seed` (membuat akun admin, teknisi, pelapor; password `password123`).
5. `npm run dev`

## Endpoint
Semua endpoint selain `/auth/register` dan `/auth/login` memerlukan header `Authorization: Bearer <token>`.

| Metode | Jalur | Peran | Keterangan | Sukses / Gagal |
| --- | --- | --- | --- | --- |
| POST | /auth/register | publik | Daftar akun pelapor. Body: nama, email, password, no_hp | 201 / 400, 409 |
| POST | /auth/login | publik | Body: email, password. Jawaban: token + user | 200 / 400, 401 |
| GET | /auth/me | semua | Profil dari token | 200 / 401 |
| GET | /auth/teknisi | admin | Daftar teknisi untuk penugasan | 200 / 403 |
| GET | /ruangan, /ruangan/:id | semua | Daftar atau detail ruangan | 200 / 404 |
| POST, PUT, DELETE | /ruangan, /ruangan/:id | admin | Kelola ruangan. Body: nm_ruang, gedung, lantai | 201, 200, 204 / 400, 404, 409 |
| GET | /fasilitas, /fasilitas/:id | semua | Daftar atau detail fasilitas | 200 / 404 |
| POST, PUT, DELETE | /fasilitas, /fasilitas/:id | admin | Kelola fasilitas. Body: nm_fasilitas, kategori, kondisi | 201, 200, 204 / 400, 404, 409 |
| POST | /tiket | pelapor | multipart/form-data: foto (file), id_ruangan, id_fasilitas, judul, deskripsi | 201 / 400 |
| GET | /tiket | semua | Pelapor: miliknya; teknisi: tugasnya; admin: semua. Filter: status, kategori, dari, sampai | 200 |
| GET | /tiket/:id | semua (sesuai hak) | Detail + timeline + rating | 200 / 403, 404 |
| POST | /tiket/:id/tugaskan | admin | Body: id_teknisi, catatan. submitted -> assigned | 201 / 400, 404, 409 |
| PUT | /tiket/:id/status | teknisi | Body: status (in_progress / resolved), keterangan | 200 / 403, 404, 409 |
| POST | /tiket/:id/rating | pelapor | Body: nilai (1-5), ulasan. resolved -> closed | 201 / 400, 404, 409 |
| GET | /rekap/ringkasan | admin | Jumlah per status + rata-rata rating. Filter: dari, sampai | 200 |
| GET | /rekap/terbanyak | admin | Fasilitas dan ruangan paling sering dilaporkan | 200 |
