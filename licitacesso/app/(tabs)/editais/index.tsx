import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  BidCard,
  BidCardSkeleton,
  EmptyState,
  ScreenLayout,
} from '../../../src/presentation/components';
import { useEditaisViewModel } from '../../../src/presentation/viewmodels';

const FILTER_OPTIONS = [
  { label: 'Todos', key: 'all' },
  { label: 'Perto de mim', key: 'nearby' },
  { label: 'Obras', key: 'obras' },
  { label: 'Papelaria', key: 'papelaria' },
  { label: 'Prazo Urgente', key: 'urgent', danger: true },
];

export default function EditaisScreen() {
  const {
    filteredBids,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    loading,
    error,
    retry,
  } = useEditaisViewModel();
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_OPTIONS.map(f => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  f.danger && !isActive && styles.filterChipDanger,
                  f.danger && isActive && styles.filterChipDangerActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                    f.danger && !isActive && styles.filterChipTextDanger,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results */}
        {loading ? (
          <>
            <BidCardSkeleton />
            <BidCardSkeleton />
            <BidCardSkeleton />
          </>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="wifi-off" size={40} color={colors.danger} />
            <Text style={styles.errorTitle}>Algo deu errado</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={retry} style={styles.retryButton} activeOpacity={0.8}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBids.length === 0 ? (
          <EmptyState
            title="Nenhuma oportunidade encontrada"
            subtitle={
              searchQuery
                ? `Sem resultados para "${searchQuery}". Tente outro termo ou remova os filtros.`
                : 'Nenhum edital nesta categoria no momento.'
            }
          />
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
  filterChipDangerActive: { backgroundColor: colors.danger, borderColor: colors.danger },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: '#fff' },
  filterChipTextDanger: { color: colors.danger },
  // Error state
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  errorText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
