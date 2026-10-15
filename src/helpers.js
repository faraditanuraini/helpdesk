export function formatTanggal(dateString) {
  if (!dateString) return 'Hari ini';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function validateForm(judul, lokasi, deskripsi) {
  if (!judul || !judul.trim()) return 'Judul laporan kerusakan wajib diisi.';
  if (!lokasi || !lokasi.trim()) return 'Lokasi gedung/ruangan wajib diisi.';
  if (!deskripsi || !deskripsi.trim()) return 'Deskripsi kendala wajib diisi.';
  return null;
}