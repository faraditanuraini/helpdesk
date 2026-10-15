import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TiketList({ items = [], role, onRefresh, onOpenDetail, onOpenCreate }) {
  // Hitung jumlah statistik tiket
  const totalPending = items.filter(i => (i.status || '').toLowerCase() === 'pending').length;
  const totalProses = items.filter(i => (i.status || '').toLowerCase().includes('proses')).length;
  const totalSelesai = items.filter(i => (i.status || '').toLowerCase().includes('selesai')).length;

  return (
    <ScrollView style={styles.container}>
      {/* 1. AKSI CEPAT / BANNER INFORMASI PER ROLE */}
      {role === 'Pelapor' && (
        <View style={styles.actionCard}>
          <Text style={styles.actionCardText}>Ada fasilitas yang bermasalah? Kami siap membantu.</Text>
          <Pressable style={styles.primaryButton} onPress={onOpenCreate}>
            <Text style={styles.primaryButtonText}>+ Buat Tiket Pengaduan Baru</Text>
          </Pressable>
        </View>
      )}

      {role === 'Admin Sarpras' && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Pusat Kelola Sarpras</Text>
          <Text style={styles.infoBannerText}>
            {totalPending} tiket baru menunggu penugasan teknisi.
          </Text>
        </View>
      )}

      {role === 'Teknisi' && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Daftar Work Order</Text>
          <Text style={styles.infoBannerText}>
            {totalProses} tugas perbaikan sedang aktif kamu kerjakan.
          </Text>
        </View>
      )}

      {/* 2. RINGKASAN STATISTIK TIKET */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIndicator, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.statNumber}>{totalPending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.statNumber}>{totalProses}</Text>
          <Text style={styles.statLabel}>Diproses</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIndicator, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.statNumber}>{totalSelesai}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      {/* 3. HEADER DAFTAR TIKET */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {role === 'Teknisi' ? 'Tugas Aktif' : 'Tiket Aktif'}
        </Text>
        <Pressable onPress={onRefresh}>
          <Text style={styles.refreshText}>↻ Refresh ({items.length})</Text>
        </Pressable>
      </View>

      {/* 4. LIST DAFTAR TIKET */}
      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada data pengaduan masuk.</Text>
        </View>
      ) : (
        items.map((item) => {
          const statusLower = (item.status || 'pending').toLowerCase();
          const isPending = statusLower === 'pending';

          return (
            <Pressable
              key={String(item.id)}
              style={styles.ticketCard}
              onPress={() => onOpenDetail(item.id)}
            >
              <View style={styles.ticketCardHeader}>
                <Text style={styles.ticketId}>#STK-2026-00{item.id}</Text>
                <View style={[styles.badge, isPending ? styles.badgePending : styles.badgeProses]}>
                  <View style={[styles.badgeDot, { backgroundColor: isPending ? '#EAB308' : '#2563EB' }]} />
                  <Text style={[styles.badgeText, { color: isPending ? '#854D0E' : '#2563EB' }]}>
                    {item.status || 'Submitted'}
                  </Text>
                </View>
              </View>

              <Text style={styles.ticketTitle}>{item.judul_laporan || item.judul}</Text>
              <Text style={styles.ticketLocation}>{item.lokasi || 'Fakultas Sains dan Teknologi'}</Text>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>
                  {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : 'Hari ini'}
                </Text>
                <Text style={styles.detailLink}>Lihat Detail →</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actionCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  actionCardText: { color: '#64748B', fontSize: 12, marginBottom: 10 },
  primaryButton: { height: 44, backgroundColor: '#2563EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  infoBanner: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoBannerTitle: { fontSize: 13, fontWeight: '700', color: '#1E3A8A' },
  infoBannerText: { fontSize: 11, color: '#1E3A8A', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  statIndicator: { width: 18, height: 3, borderRadius: 2, marginBottom: 8 },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  refreshText: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  ticketCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  ticketCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketId: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  ticketTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  ticketLocation: { fontSize: 11, color: '#64748B', marginBottom: 10 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  ticketDate: { fontSize: 10, color: '#94A3B8' },
  detailLink: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
  badgePending: { backgroundColor: '#FEF9C3' },
  badgeProses: { backgroundColor: '#EFF6FF' },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  emptyBox: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748B', fontSize: 12 },
});