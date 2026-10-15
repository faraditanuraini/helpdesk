import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function KategoriFasilitas({ categories = [], selectedId, onSelect, disabled = false }) {
  // Master data kategori default jika data dari API belum termuat
  const defaultCategories = [
    { id: 1, nama: 'AC / Pendingin' },
    { id: 2, nama: 'Proyektor' },
    { id: 3, nama: 'Smart TV' },
    { id: 4, nama: 'Sanitasi / Toilet' },
    { id: 5, nama: 'Lainnya' },
  ];

  const listToRender = categories.length > 0 ? categories : defaultCategories;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kategori Fasilitas *</Text>
      <View style={styles.chipWrap}>
        {listToRender.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <Pressable
              key={String(item.id)}
              disabled={disabled}
              onPress={() => onSelect(item.id)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                disabled && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {isSelected ? '✓ ' : ''}{item.nama}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
});