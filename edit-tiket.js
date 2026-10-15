import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { api } from './src/api';
import { validateForm } from './src/helpers';

export default function EditTiket({ item, onBack, onSuccess }) {
  const [judul, setJudul] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState('Submitted');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Isi form awal dengan data tiket yang dipilih
  useEffect(() => {
    if (item) {
      setJudul(item.judul_laporan || item.judul || '');
      setLokasi(item.lokasi || '');
      setDeskripsi(item.deskripsi || '');
      setStatus(item.status || 'Submitted');
    }
  }, [item]);

  async function handleUpdate() {
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
        status: status,
      };

      await api.update(item.id, payload);
      onSuccess(); // Kembali ke daftar & reload data
    } catch (e) {
      setError(e.message || 'Gagal memperbarui data pengaduan.');
    } finally {
      setBusy(false);
    }
  }

  if (!item) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Data tiket tidak ditemukan.</Text>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const statusOptions = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>Ubah Laporan #STK-2026-00{item.id}</Text>
        <Text style={styles.infoBannerText}>
          Perbarui informasi lokasi, deskripsi kendala, atau status pengerjaan tiket ini.
        </Text>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* INPUT JUDUL */}
      <Text style={styles.formLabel}>Judul Laporan Kerusakan *</Text>
      <TextInput
        style={styles.formInput}
        value={judul}
        onChangeText={setJudul}
        editable={!busy}
        maxLength={100}
        placeholder="Judul laporan"
      />

      {/* INPUT LOKASI */}
      <Text style={styles.formLabel}>Gedung & Ruangan *</Text>
      <TextInput
        style={styles.formInput}
        value={lokasi}
        onChangeText={setLokasi}
        editable={!busy}
        placeholder="Lokasi fasilitas"
      />

      {/* PILIHAN STATUS TIKET */}
      <Text style={styles.formLabel}>Status Penanganan *</Text>
      <View style={styles.statusWrap}>
        {statusOptions.map((st) => (
          <Pressable
            key={st}
            disabled={busy}
            onPress={() => setStatus(st)}
            style={[styles.statusChip, status === st && styles.statusChipSelected]}
          >
            <Text style={[styles.statusChipText, status === st && styles.statusChipTextSelected]}>
              {st}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* INPUT DESKRIPSI */}
      <Text style={styles.formLabel}>Deskripsi Detail Kendala *</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        value={deskripsi}
        onChangeText={setDeskripsi}
        multiline
        numberOfLines={4}
        editable={!busy}
        placeholder="Deskripsi detail kendala"
      />

      {/* TOMBOL AKSI */}
      <View style={styles.buttonGroup}>
        <Pressable
          disabled={busy}
          onPress={handleUpdate}
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Simpan Perubahan</Text>
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
  infoBanner: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  infoBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  infoBannerText: { fontSize: 11, color: '#92400E', marginTop: 2 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#0F172A', marginTop: 12, marginBottom: 6 },
  formInput: { minHeight: 48, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, color: '#0F172A' },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  statusChipSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  statusChipText: { fontSize: 11, color: '#64748B' },
  statusChipTextSelected: { color: '#2563EB', fontWeight: '600' },
  buttonGroup: { marginTop: 24, marginBottom: 40, gap: 8 },
  primaryButton: { height: 48, backgroundColor: '#2563EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  secondaryButton: { height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  secondaryButtonText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 },
  emptyBox: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748B', fontSize: 13, marginBottom: 12 },
});