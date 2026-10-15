import { useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { api } from './src/api';
import { validateForm } from './src/helpers';

export default function BuatTiket({ onBack, onSuccess }) {
  const [judul, setJudul] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Daftar kategori fasilitas sampel
  const categories = [
    { id: 1, nama: 'AC / Pendingin' },
    { id: 2, nama: 'Proyektor' },
    { id: 3, nama: 'Smart TV' },
    { id: 4, nama: 'Sanitasi / Toilet' },
    { id: 5, nama: 'Lainnya' },
  ];

  async function handleSimpan() {
    const errPesan = validateForm(judul, lokasi, deskripsi);
    if (errPesan) {
      setError(errPesan);
      return;
    }

    setBusy(true);
    setError('');

    try {
      const payload = {
        judul_laporan: judul.trim(),
        lokasi: lokasi.trim(),
        deskripsi: deskripsi.trim(),
        id_kategori: categoryId,
      };

      await api.create(payload);
      onSuccess(); // Kembali ke daftar tiket & reload
    } catch (e) {
      setError(e.message || 'Gagal mengirim tiket pengaduan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* BANNER PETUNJUK */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>Form Pengaduan Fasilitas</Text>
        <Text style={styles.infoBannerText}>
          Lengkapi lokasi dan deskripsi detail agar teknisi Sarpras dapat menindaklanjuti dengan tepat.
        </Text>
      </View>

      {/* ERROR MESSAGE */}
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* INPUT JUDUL */}
      <Text style={styles.formLabel}>Judul Laporan Kerusakan *</Text>
      <TextInput
        style={styles.formInput}
        value={judul}
        onChangeText={setJudul}
        editable={!busy}
        maxLength={100}
        placeholder="Contoh: AC R.302 Tidak Dingin"
        placeholderTextColor="#94A3B8"
      />

      {/* INPUT LOKASI / RUANGAN */}
      <Text style={styles.formLabel}>Gedung & Ruangan *</Text>
      <TextInput
        style={styles.formInput}
        value={lokasi}
        onChangeText={setLokasi}
        editable={!busy}
        placeholder="Contoh: Gedung A · Lantai 3 · Ruang 302"
        placeholderTextColor="#94A3B8"
      />

      {/* KATEGORI FASILITAS (CHIPS) */}
      <Text style={styles.formLabel}>Kategori Fasilitas *</Text>
      <View style={styles.categoryWrap}>
        {categories.map((k) => (
          <Pressable
            key={String(k.id)}
            disabled={busy}
            onPress={() => setCategoryId(k.id)}
            style={[styles.categoryChip, categoryId === k.id && styles.categoryChipSelected]}
          >
            <Text style={[styles.categoryChipText, categoryId === k.id && styles.categoryChipTextSelected]}>
              {k.nama}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* INPUT DESKRIPSI DETAIL */}
      <Text style={styles.formLabel}>Deskripsi Detail Kendala *</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        value={deskripsi}
        onChangeText={setDeskripsi}
        multiline
        numberOfLines={4}
        editable={!busy}
        placeholder="Jelaskan gejala dan kondisi fasilitas (misal: air menetes sejak pagi)..."
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.fieldNote}>* Wajib diisi. Laporan akan langsung ditinjau oleh Admin Sarpras.</Text>

      {/* TOMBOL AKSI */}
      <View style={styles.buttonGroup}>
        <Pressable
          disabled={busy}
          onPress={handleSimpan}
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Kirim Tiket Helpdesk</Text>
          )}
        </Pressable>

        <Pressable disabled={busy} onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Batal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  infoBanner: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoBannerTitle: { fontSize: 13, fontWeight: '700', color: '#1E3A8A' },
  infoBannerText: { fontSize: 11, color: '#1E3A8A', marginTop: 2, lineHeight: 16 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#0F172A', marginTop: 12, marginBottom: 6 },
  formInput: { minHeight: 48, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, color: '#0F172A' },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  categoryChipSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  categoryChipText: { fontSize: 11, color: '#64748B' },
  categoryChipTextSelected: { color: '#2563EB', fontWeight: '600' },
  fieldNote: { fontSize: 10, color: '#64748B', marginTop: 8 },
  buttonGroup: { marginTop: 24, marginBottom: 40, gap: 8 },
  primaryButton: { height: 48, backgroundColor: '#2563EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  secondaryButton: { height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  secondaryButtonText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 },
});