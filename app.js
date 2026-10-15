import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SaintekCareApp />
    </SafeAreaProvider>
  );
}

function SaintekCareApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('Pelapor'); // 'Pelapor', 'Admin Sarpras', 'Teknisi'
  const [screen, setScreen] = useState('beranda'); // 'beranda', 'buat-tiket', 'linimasa', 'rekap'
  
  // Data Tiket Sampel
  const [tickets, setTickets] = useState([
    { id: 'STK-2026-001', judul: 'AC R.302', lokasi: 'Gedung A · Lantai 3', status: 'Diproses', tanggal: '9 Okt 2026, 08:10', pesan: 'Budi sedang melakukan perbaikan', deskripsi: 'AC tidak dingin dan meneteskan air sejak pagi.' },
    { id: 'STK-2026-006', judul: 'Proyektor Lab Komputer', lokasi: 'Gedung Lab · Lantai 1', status: 'Diproses', tanggal: '8 Okt 2026, 13:20', pesan: 'Ditangani oleh Rina', deskripsi: 'Layar proyektor berkedip dan warna kekuningan.' },
    { id: 'STK-2026-009', judul: 'AC Lab Komputer', lokasi: 'Gedung Lab · Lantai 2', status: 'Pending', tanggal: '9 Okt 2026, 09:40', pesan: 'Menunggu penugasan teknisi', deskripsi: 'AC tidak menyala sama sekali.' },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalPenugasan, setModalPenugasan] = useState(false);

  // Form State
  const [formJudul, setFormJudul] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  // 1. HALAMAN LOGIN
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.loginScroll}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginHeaderTitle}>SaintekCare Helpdesk</Text>
            <Text style={styles.loginHeaderSubtitle}>Fakultas Sains dan Teknologi</Text>
            <Text style={styles.loginHeaderTagline}>Fasilitas terawat. Aktivitas lancar.</Text>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.welcomeTitle}>Selamat datang kembali</Text>
            <Text style={styles.welcomeDesc}>Pilih peran dan masuk dengan akun kampus Anda.</Text>

            {/* Switch Role */}
            <View style={styles.roleSwitch}>
              {['Pelapor', 'Admin Sarpras', 'Teknisi'].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                >
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Email/NIM/NIP</Text>
            <TextInput style={styles.input} defaultValue="faradita@mahasiswa.ac.id" />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} secureTextEntry defaultValue="12345678" />

            <Pressable style={styles.loginSubmitBtn} onPress={() => setIsLoggedIn(true)}>
              <Text style={styles.loginSubmitText}>Masuk ke System Helpdesk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. HALAMAN UTAMA (PELAPOR / ADMIN / TEKNISI)
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Navy */}
      <View style={styles.headerNavy}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerRoleText}>{role}</Text>
            <Text style={styles.headerTitleText}>SaintekCare Helpdesk</Text>
          </View>
          <Pressable style={styles.logoutBtn} onPress={() => setIsLoggedIn(false)}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>
      </View>

      {/* Body Screen */}
      <ScrollView style={styles.body}>
        {screen === 'beranda' && (
          <View style={styles.sectionPadding}>
            {/* Action Banner */}
            {role === 'Pelapor' && (
              <View style={styles.bannerBox}>
                <Text style={styles.bannerDesc}>Ada fasilitas yang bermasalah? Kami siap membantu.</Text>
                <Pressable style={styles.primaryBtn} onPress={() => setScreen('buat-tiket')}>
                  <Text style={styles.primaryBtnText}>+ Buat Tiket Pengaduan Baru</Text>
                </Pressable>
              </View>
            )}

            {/* Grid Statistik */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statBar, { backgroundColor: '#EAB308' }]} />
                <Text style={styles.statNum}>1</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statBox}>
                <View style={[styles.statBar, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.statNum}>2</Text>
                <Text style={styles.statLabel}>Diproses</Text>
              </View>
              <View style={styles.statBox}>
                <View style={[styles.statBar, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.statNum}>5</Text>
                <Text style={styles.statLabel}>Selesai</Text>
              </View>
            </View>

            {/* Daftar Tiket */}
            <Text style={styles.sectionTitle}>Tiket Aktif</Text>
            {tickets.map((t) => (
              <Pressable
                key={t.id}
                style={styles.ticketCard}
                onPress={() => {
                  setSelectedTicket(t);
                  setScreen('linimasa');
                }}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketId}>{t.id}</Text>
                  <View style={[styles.badge, t.status === 'Pending' ? styles.badgePending : styles.badgeProses]}>
                    <Text style={[styles.badgeText, { color: t.status === 'Pending' ? '#854D0E' : '#2563EB' }]}>
                      {t.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketJudul}>{t.judul}</Text>
                <Text style={styles.ticketLokasi}>{t.lokasi}</Text>
                <Text style={styles.ticketTanggal}>{t.tanggal}</Text>

                {role === 'Admin Sarpras' && t.status === 'Pending' && (
                  <Pressable
                    style={styles.assignBtn}
                    onPress={() => {
                      setSelectedTicket(t);
                      setModalPenugasan(true);
                    }}
                  >
                    <Text style={styles.assignBtnText}>Tugaskan Teknisi</Text>
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Form Buat Tiket */}
        {screen === 'buat-tiket' && (
          <View style={styles.sectionPadding}>
            <Text style={styles.screenHeading}>Buat Tiket Pengaduan</Text>
            <Text style={styles.label}>Judul Kerusakan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: AC Ruang 302 Tidak Dingin"
              value={formJudul}
              onChangeText={setFormJudul}
            />

            <Text style={styles.label}>Gedung & Ruangan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Gedung A · Lantai 3 · Ruang 302"
              value={formLokasi}
              onChangeText={setFormLokasi}
            />

            <Text style={styles.label}>Deskripsi Detail Kendala *</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              multiline
              placeholder="Jelaskan gejala kerusakan..."
              value={formDeskripsi}
              onChangeText={setFormDeskripsi}
            />

            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                Alert.alert('Sukses', 'Tiket pengaduan berhasil dikirim!');
                setScreen('beranda');
              }}
            >
              <Text style={styles.primaryBtnText}>Kirim Tiket Helpdesk</Text>
            </Pressable>
          </View>
        )}

        {/* Linimasa Status Tiket */}
        {screen === 'linimasa' && selectedTicket && (
          <View style={styles.sectionPadding}>
            <Text style={styles.screenHeading}>Linimasa {selectedTicket.id}</Text>
            <View style={styles.ticketCard}>
              <Text style={styles.ticketJudul}>{selectedTicket.judul}</Text>
              <Text style={styles.ticketLokasi}>{selectedTicket.lokasi}</Text>
              <Text style={styles.ticketDesc}>{selectedTicket.deskripsi}</Text>
            </View>

            <View style={styles.timelineBox}>
              <Text style={styles.timelineStep}>✓ 1. Tiket Diterima System (08:10)</Text>
              <Text style={styles.timelineStep}>✓ 2. Teknisi Ditugaskan (08:30)</Text>
              <Text style={styles.timelineStepActive}>➜ 3. Proses Perbaikan (Berjalan)</Text>
              <Text style={styles.timelineStepDisabled}>○ 4. Perbaikan Selesai</Text>
            </View>

            <Pressable style={styles.secondaryBtn} onPress={() => setScreen('beranda')}>
              <Text style={styles.secondaryBtnText}>Kembali ke Beranda</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => setScreen('beranda')}>
          <Text style={[styles.navText, screen === 'beranda' && styles.navTextActive]}>Beranda</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => setScreen('buat-tiket')}>
          <Text style={[styles.navText, screen === 'buat-tiket' && styles.navTextActive]}>Buat Tiket</Text>
        </Pressable>
      </View>

      {/* Modal Penugasan Admin */}
      <Modal visible={modalPenugasan} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tugaskan Teknisi</Text>
            <Text style={styles.label}>Pilih Teknisi Tersedia:</Text>
            <Pressable style={styles.input}>
              <Text>Andi (Spesialis AC & Kelistrikan)</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                Alert.alert('Berhasil', 'Teknisi berhasil ditugaskan!');
                setModalPenugasan(false);
              }}
            >
              <Text style={styles.primaryBtnText}>Konfirmasi Penugasan</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setModalPenugasan(false)}>
              <Text style={styles.secondaryBtnText}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loginScroll: { padding: 20, justifyContent: 'center' },
  loginHeader: { backgroundColor: '#1E3A8A', padding: 20, borderRadius: 16, marginBottom: 20 },
  loginHeaderTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  loginHeaderSubtitle: { color: '#DBEAFE', fontSize: 13 },
  loginHeaderTagline: { color: '#FFFFFF', fontSize: 12, marginTop: 8 },
  loginCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  welcomeDesc: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  roleSwitch: { flexDirection: 'row', backgroundColor: '#E2E8F0', padding: 4, borderRadius: 8, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  roleBtnActive: { backgroundColor: '#FFFFFF' },
  roleBtnText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  roleBtnTextActive: { color: '#1E3A8A', fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', color: '#0F172A', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 8 },
  loginSubmitBtn: { backgroundColor: '#2563EB', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  loginSubmitText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  headerNavy: { backgroundColor: '#1E3A8A', paddingHorizontal: 18, paddingVertical: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRoleText: { color: '#BFDBFE', fontSize: 11 },
  headerTitleText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  body: { flex: 1 },
  sectionPadding: { padding: 16 },
  bannerBox: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  bannerDesc: { color: '#64748B', fontSize: 12, marginBottom: 10 },
  primaryBtn: { backgroundColor: '#2563EB', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  secondaryBtn: { backgroundColor: '#F1F5F9', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  secondaryBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  statBar: { width: 20, height: 3, borderRadius: 2, marginBottom: 6 },
  statNum: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  ticketCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketId: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  ticketJudul: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  ticketLokasi: { fontSize: 11, color: '#64748B', marginVertical: 2 },
  ticketTanggal: { fontSize: 10, color: '#94A3B8' },
  ticketDesc: { fontSize: 12, color: '#334155', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgePending: { backgroundColor: '#FEF9C3' },
  badgeProses: { backgroundColor: '#EFF6FF' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  assignBtn: { marginTop: 10, backgroundColor: '#EFF6FF', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  assignBtnText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  screenHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  timelineBox: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginVertical: 12, gap: 10 },
  timelineStep: { fontSize: 12, color: '#16A34A', fontWeight: '500' },
  timelineStepActive: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  timelineStepDisabled: { fontSize: 12, color: '#94A3B8' },
  bottomNav: { height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  navTextActive: { color: '#2563EB', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
});