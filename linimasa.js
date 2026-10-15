import { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { api } from './src/api';

export default function LinimasaDetail({ item, role, onBack, onOpenEdit, onRefreshList }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!item) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Data tiket tidak ditemukan.</Text>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Kembali ke Daftar</Text>
        </Pressable>
      </View>
    );
  }

  // Fungsi Hapus Laporan (khusus Pelapor/Admin)
  async function handleHapus() {
    Alert.alert(
      'Konfirmasi Hapus',
      `Yakin ingin menghapus laporan "${item.judul_laporan || item.judul}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await api.remove(item.id);
              onRefreshList();
            } catch (e) {
              setError(e.message || 'Gagal menghapus laporan');
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  // Menentukan urutan langkah status linimasa
  const currentStatus = (item.status || 'Submitted').toLowerCase();
  const isSubmitted = true;
  const isAssigned = currentStatus.includes('assigned') || currentStatus.includes('proses') || currentStatus.includes('selesai');
  const isInProgress = currentStatus.includes('proses') || currentStatus.includes('selesai');
  const isResolved = currentStatus.includes('selesai') || currentStatus.includes('resolved');

  return (
    <ScrollView style={styles.container}>
      {/* 1. KARTU RINGKASAN TIKET */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>#STK-2026-00{item.id}</Text>
          <View style={styles.badgeProses}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{item.status || 'Submitted'}</Text>
          </View>
        </View>

        <Text style={styles.ticketTitle}>{item.judul_laporan || item.judul}</Text>
        <Text style={styles.ticketLocation}>📍 {item.lokasi || 'Gedung Saintek'}</Text>
        
        <Text style={styles.sectionSubTitle}>Deskripsi Kerusakan:</Text>
        <Text style={styles.descBox}>{item.deskripsi || 'Tidak ada deskripsi detail.'}</Text>
        
        <Text style={styles.dateText}>
          Dilaporkan pada: {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : 'Hari ini'}
        </Text>
      </View>

      {/* 2. LINIMASA PROGRES PENANGANAN (STEPPER VERTIKAL) */}
      <Text style={styles.sectionTitle}>Linimasa Progres Penanganan</Text>
      
      <View style={styles.timelineContainer}>
        {/* Step 1: Submitted */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[styles.circle, isSubmitted && styles.circleActive]}>
              <Text style={styles.circleText}>1</Text>
            </View>
            <View style={[styles.line, isAssigned && styles.lineActive]} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.stepTitle}>Tiket Diterima Sistem</Text>
            <Text style={styles.stepDesc}>Laporan pengaduan berhasil masuk ke database Sarpras.</Text>
          </View>
        </View>

        {/* Step 2: Assigned */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[styles.circle, isAssigned && styles.circleActive]}>
              <Text style={styles.circleText}>2</Text>
            </View>
            <View style={[styles.line, isInProgress && styles.lineActive]} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.stepTitle}>Teknisi Ditugaskan</Text>
            <Text style={styles.stepDesc}>Admin Sarpras telah menugaskan tim teknisi lapangan.</Text>
          </View>
        </View>

        {/* Step 3: In Progress */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[styles.circle, isInProgress && styles.circleActive]}>
              <Text style={styles.circleText}>3</Text>
            </View>
            <View style={[styles.line, isResolved && styles.lineActive]} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.stepTitle}>Proses Perbaikan</Text>
            <Text style={styles.stepDesc}>Teknisi sedang melakukan perbaikan di lokasi fasilitas.</Text>
          </View>
        </View>

        {/* Step 4: Resolved */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[styles.circle, isResolved && styles.circleActive]}>
              <Text style={styles.circleText}>4</Text>
            </View>
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.stepTitle}>Perbaikan Selesai</Text>
            <Text style={styles.stepDesc}>Fasilitas telah diperbaiki dan siap digunakan kembali.</Text>
          </View>
        </View>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {busy && <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />}

      {/* 3. TOMBOL AKSI DISESUAIKAN BERDASARKAN ROLE */}
      <View style={styles.actionGroup}>
        {role === 'Pelapor' && (
          <>
            <Pressable disabled={busy} onPress={onOpenEdit} style={styles.warningButton}>
              <Text style={styles.buttonText}>Ubah Laporan</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={handleHapus} style={styles.dangerButton}>
              <Text style={styles.buttonText}>Hapus Tiket</Text>
            </Pressable>
          </>
        )}

        {role === 'Admin Sarpras' && (
          <Pressable disabled={busy} onPress={onOpenEdit} style={styles.primaryButton}>
            <Text style={styles.buttonText}>Tugaskan Teknisi / Edit Status</Text>
          </Pressable>
        )}

        {role === 'Teknisi' && (
          <Pressable disabled={busy} onPress={onOpenEdit} style={styles.successButton}>
            <Text style={styles.buttonText}>Update Status Pengerjaan</Text>
          </Pressable>
        )}

        <Pressable disabled={busy} onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  ticketTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  ticketLocation: { fontSize: 12, color: '#2563EB', fontWeight: '500', marginBottom: 8 },
  sectionSubTitle: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 },
  descBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, fontSize: 12, color: '#334155', marginVertical: 6, lineHeight: 18 },
  dateText: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  badgeProses: { backgroundColor: '#EFF6FF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2563EB' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#2563EB' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  timelineContainer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', minHeight: 64 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 26 },
  circle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  circleActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  circleText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  lineActive: { backgroundColor: '#22C55E' },
  timelineRight: { flex: 1, paddingTop: 2 },
  stepTitle: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  stepDesc: { fontSize: 10, color: '#64748B', marginTop: 2, lineHeight: 14 },
  actionGroup: { gap: 8, marginBottom: 40 },
  primaryButton: { height: 44, backgroundColor: '#2563EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  successButton: { height: 44, backgroundColor: '#16A34A', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  warningButton: { height: 44, backgroundColor: '#D97706', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dangerButton: { height: 44, backgroundColor: '#EF4444', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  secondaryButton: { height: 44, backgroundColor: '#F1F5F9', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  secondaryButtonText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#64748B', fontSize: 14, marginBottom: 12 },
  backBtn: { padding: 10, backgroundColor: '#2563EB', borderRadius: 8 },
  backBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8, textAlign: 'center' },
});