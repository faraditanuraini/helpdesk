// Ganti IP sesuai server backend kamu
const BASE_URL = 'http://192.168.110.96/api'; 

export const api = {
  async list() {
    const res = await fetch(`${BASE_URL}/pengaduan`);
    if (!res.ok) throw new Error('Gagal mengambil data pengaduan');
    return await res.json();
  },

  async detail(id) {
    const res = await fetch(`${BASE_URL}/pengaduan/${id}`);
    if (!res.ok) throw new Error('Gagal mengambil detail pengaduan');
    return await res.json();
  },

  async create(data) {
    const res = await fetch(`${BASE_URL}/pengaduan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal membuat pengaduan baru');
    return await res.json();
  },

  async update(id, data) {
    const res = await fetch(`${BASE_URL}/pengaduan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memperbarui pengaduan');
    return await res.json();
  },

  async remove(id) {
    const res = await fetch(`${BASE_URL}/pengaduan/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus pengaduan');
    return await res.json();
  },

  async categories() {
    const res = await fetch(`${BASE_URL}/kategori`);
    if (!res.ok) return [];
    return await res.json();
  },
};