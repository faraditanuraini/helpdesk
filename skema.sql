-- skema.sql : SaintekCare Helpdesk (diturunkan dari CDM/PDM kelompok 4, dengan perbaikan)
DROP DATABASE IF EXISTS db_helpdesk;
CREATE DATABASE db_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_helpdesk;

-- 1) tabel induk (tidak punya FK)
CREATE TABLE pengguna (
  id_pengguna   INT AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(45)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  no_hp         VARCHAR(15),
  role          ENUM('pelapor','teknisi','admin') NOT NULL DEFAULT 'pelapor'
);

CREATE TABLE ruangan (
  id_ruangan INT AUTO_INCREMENT PRIMARY KEY,
  nm_ruang   VARCHAR(45) NOT NULL,
  gedung     VARCHAR(25) NOT NULL,
  lantai     VARCHAR(15) NOT NULL
);

CREATE TABLE fasilitas (
  id_fasilitas INT AUTO_INCREMENT PRIMARY KEY,
  nm_fasilitas VARCHAR(25) NOT NULL,
  kategori     VARCHAR(25) NOT NULL,
  kondisi      VARCHAR(25) NOT NULL DEFAULT 'baik'
);

-- 2) tiket (menunjuk pengguna, ruangan, fasilitas)
CREATE TABLE tiket (
  id_tiket     INT AUTO_INCREMENT PRIMARY KEY,
  id_pengguna  INT NOT NULL,
  id_ruangan   INT NOT NULL,
  id_fasilitas INT NOT NULL,
  judul        VARCHAR(100) NOT NULL,
  deskripsi    TEXT NOT NULL,
  foto_url     VARCHAR(255) NOT NULL,
  status       ENUM('submitted','assigned','in_progress','resolved','closed')
               NOT NULL DEFAULT 'submitted',
  tgl_lapor    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tgl_update   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pengguna)  REFERENCES pengguna(id_pengguna)   ON UPDATE CASCADE,
  FOREIGN KEY (id_ruangan)   REFERENCES ruangan(id_ruangan)     ON UPDATE CASCADE,
  FOREIGN KEY (id_fasilitas) REFERENCES fasilitas(id_fasilitas) ON UPDATE CASCADE
);

-- 3) tabel anak tiket
CREATE TABLE penugasan (
  id_penugasan INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket     INT NOT NULL UNIQUE,          -- UNIQUE: satu tiket satu penugasan
  id_teknisi   INT NOT NULL,
  id_admin     INT NOT NULL,
  tgl_tugas    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  catatan      TEXT,
  FOREIGN KEY (id_tiket)   REFERENCES tiket(id_tiket)       ON DELETE CASCADE,
  FOREIGN KEY (id_teknisi) REFERENCES pengguna(id_pengguna),
  FOREIGN KEY (id_admin)   REFERENCES pengguna(id_pengguna)
);

CREATE TABLE timeline (
  id_timeline  INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket     INT NOT NULL,
  status       ENUM('submitted','assigned','in_progress','resolved','closed') NOT NULL,
  keterangan   VARCHAR(100) NOT NULL,
  waktu_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tiket) REFERENCES tiket(id_tiket) ON DELETE CASCADE
);

CREATE TABLE rating (
  id_rating INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket  INT NOT NULL UNIQUE,             -- UNIQUE: satu rating per tiket
  nilai     TINYINT NOT NULL,
  ulasan    TEXT,
  tgl       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_nilai CHECK (nilai BETWEEN 1 AND 5),
  FOREIGN KEY (id_tiket) REFERENCES tiket(id_tiket) ON DELETE CASCADE
);

-- 4) data awal (akun pengguna dibuat lewat `npm run seed` agar password di-hash dengan benar)
INSERT INTO ruangan (nm_ruang, gedung, lantai) VALUES
 ('Lab Komputer 1','Gedung A','2'),('Ruang Kelas A301','Gedung A','3'),('Toilet Pria','Gedung B','1');
INSERT INTO fasilitas (nm_fasilitas, kategori) VALUES
 ('AC Split','Pendingin'),('Proyektor Epson','Multimedia'),('Smart TV','Multimedia'),('Kran Air','Sanitasi');
