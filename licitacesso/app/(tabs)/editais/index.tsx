import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  Button,
  BidCard,
  ScreenLayout,
} from '../../../src/presentation/components';
import { useEditaisViewModel } from '../../../src/presentation/viewmodels';

const FILTERS = [
  { label: 'Perto de mim', active: true },
  { label: 'Obras', active: false },
  { label: 'Papelaria', active: false },
  { label: 'Prazo Urgente', active: false, danger: true },
];

export default function EditaisScreen() {
  const { filteredBids, searchQuery, setSearchQuery, loading } = useEditaisViewModel();
  const insets = useSafeAreaInsets();

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Oportunidades</Text>
          <Text style={styles.subtitle}>
            Encontre licitações explicadas de um jeito simples para você crescer.
          </Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.accent} />
          <TextInput
            style={styles.searchInput}
            placeholder="Encontre oportunidades para sua MEI..."
            placeholderTextColor={`${colors.textMuted}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.label}
              activeOpacity={0.7}
              style={[
                styles.filterChip,
                f.active && styles.filterChipActive,
                f.danger && styles.filterChipDanger,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  f.active && styles.filterChipTextActive,
                  f.danger && styles.filterChipTextDanger,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          filteredBids.map(bid => <BidCard key={bid.id} bid={bid} />)
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  header: { gap: 6 },
  title: { fontSize: 36, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterRow: { gap: 10, paddingRight: 20 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipDanger: { borderColor: `${colors.danger}60` },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: '#fff' },
  filterChipTextDanger: { color: colors.danger },
  loadingText: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
