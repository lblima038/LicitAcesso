import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  EditalCard,
  BidCardSkeleton,
  EmptyState,
  ScreenLayout,
} from '../../../src/presentation/components';
import { useEditaisViewModel } from '../../../src/presentation/viewmodels';

const PERIODOS = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: '1 ano', value: '365' },
] as const;

export default function EditaisScreen() {
  const {
    editais, paginacao, filtros, loading, error,
    periodo, setPeriodo,
    situacao, setSituacao,
    pagina, setPagina,
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
          <Text style={styles.title}>Editais</Text>
          <Text style={styles.subtitle}>Licitações públicas abertas no Brasil.</Text>
        </View>

        {/* Filtro de período */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>PERÍODO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {PERIODOS.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[styles.chip, periodo === p.value && styles.chipActive]}
                onPress={() => setPeriodo(p.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, periodo === p.value && styles.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtro de situação */}
        {filtros.situacoes.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>SITUAÇÃO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, situacao === '' && styles.chipActive]}
                onPress={() => setSituacao('')}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, situacao === '' && styles.chipTextActive]}>Todas</Text>
              </TouchableOpacity>
              {filtros.situacoes.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, situacao === s && styles.chipActive]}
                  onPress={() => setSituacao(situacao === s ? '' : s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, situacao === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contador */}
        {!loading && !error && (
          <Text style={styles.contador}>
            {paginacao.total.toLocaleString('pt-BR')} editais encontrados
          </Text>
        )}

        {/* Lista */}
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
          </View>
        ) : editais.length === 0 ? (
          <EmptyState
            title="Nenhum edital encontrado"
            subtitle="Tente ampliar o período ou remover os filtros."
          />
        ) : (
          editais.map((item, i) => (
            <EditalCard
              key={i}
              item={item}
              onPress={() => router.push(`/(tabs)/editais/${item._id}`)}
            />
          ))
        )}

        {/* Paginação */}
        {!loading && paginacao.paginas > 1 && (
          <View style={styles.paginacao}>
            <TouchableOpacity
              style={[styles.pageBtn, pagina === 1 && styles.pageBtnDisabled]}
              onPress={() => setPagina(pagina - 1)}
              disabled={pagina === 1}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={16} color={pagina === 1 ? colors.border : colors.accent} />
              <Text style={[styles.pageBtnText, pagina === 1 && styles.pageBtnTextDisabled]}>
                Anterior
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              {pagina} / {paginacao.paginas}
            </Text>

            <TouchableOpacity
              style={[styles.pageBtn, pagina === paginacao.paginas && styles.pageBtnDisabled]}
              onPress={() => setPagina(pagina + 1)}
              disabled={pagina === paginacao.paginas}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageBtnText, pagina === paginacao.paginas && styles.pageBtnTextDisabled]}>
                Próxima
              </Text>
              <Feather name="chevron-right" size={16} color={pagina === paginacao.paginas ? colors.border : colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  header: { gap: 6 },
  title: { fontSize: 36, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  contador: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  errorContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  errorText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  paginacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  pageBtnDisabled: { borderColor: colors.border },
  pageBtnText: { fontSize: 13, fontWeight: '700', color: colors.accent },
  pageBtnTextDisabled: { color: colors.border },
  pageInfo: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
});
