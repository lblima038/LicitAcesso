import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  EditalCard,
  BidCardSkeleton,
  EmptyState,
  ScreenLayout,
  situacaoStyle,
} from '../../../src/presentation/components';
import { useEditaisViewModel } from '../../../src/presentation/viewmodels';
import { useAppContext } from '../../../src/context/AppContext';
import { ApiFavorite } from '../../../src/data/apiService';

const PERIODOS = [
  { label: '7 dias',  value: '7'   },
  { label: '30 dias', value: '30'  },
  { label: '90 dias', value: '90'  },
  { label: '1 ano',   value: '365' },
] as const;

function FavoriteCard({ item, onRemove }: { item: ApiFavorite; onRemove: () => void }) {
  const dataFmt = (() => {
    try {
      return new Date(item.data_publicacao_pncp!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return ''; }
  })();

  const valorFmt = item.valor_total_estimado != null
    ? item.valor_total_estimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null;

  return (
    <TouchableOpacity
      style={styles.favCard}
      onPress={() => router.push(`/(tabs)/editais/${item.bidId}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.favCardHeader}>
        {item.situacao_nome ? (
          <View style={[styles.favSituacaoBadge, { backgroundColor: situacaoStyle(item.situacao_nome).bg }]}>
            <Text style={[styles.favSituacaoText, { color: situacaoStyle(item.situacao_nome).fg }]}>{item.situacao_nome}</Text>
          </View>
        ) : <View />}
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="bookmark" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <Text style={styles.favObjeto} numberOfLines={2}>{item.objeto_compra}</Text>
      <View style={styles.favMeta}>
        {item.municipio_nome ? (
          <View style={styles.favMetaItem}>
            <Feather name="map-pin" size={11} color={colors.textMuted} />
            <Text style={styles.favMetaText}>{item.municipio_nome}</Text>
          </View>
        ) : null}
        {dataFmt ? (
          <View style={styles.favMetaItem}>
            <Feather name="calendar" size={11} color={colors.textMuted} />
            <Text style={styles.favMetaText}>{dataFmt}</Text>
          </View>
        ) : null}
      </View>
      {valorFmt && <Text style={styles.favValor}>{valorFmt}</Text>}
    </TouchableOpacity>
  );
}

export default function EditaisScreen() {
  const {
    editais, paginacao, filtros, loading, error,
    periodo, setPeriodo,
    situacao, setSituacao,
    ramoMei, setRamoMei,
    municipio, setMunicipio,
    pagina, setPagina,
  } = useEditaisViewModel();

  const { favoritedIds, favorites, toggleFavorite } = useAppContext();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'explorar' | 'salvos'>('explorar');
  const [municipioInput, setMunicipioInput] = useState(municipio);

  const SEGMENTS = [
    { key: 'explorar', label: 'Explorar' },
    { key: 'salvos', label: favorites.length > 0 ? `Salvos (${favorites.length})` : 'Salvos' },
  ] as const;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMunicipioChange = (text: string) => {
    setMunicipioInput(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setMunicipio(text.trim()), 400);
  };

  const clearMunicipio = () => {
    setMunicipioInput('');
    setMunicipio('');
  };

  const activeFilters = [situacao, ramoMei, municipio].filter(Boolean).length;

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

        {/* Seletor Explorar / Salvos */}
        <View style={styles.segmented}>
          {SEGMENTS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.segBtn, view === s.key && styles.segBtnActive]}
              onPress={() => setView(s.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segText, view === s.key && styles.segTextActive]} numberOfLines={1}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {view === 'explorar' && (
          <>
        {/* Período */}
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

        {/* Situação */}
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

        {/* Ramo MEI */}
        {filtros.ramos_mei.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>RAMO MEI</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, ramoMei === '' && styles.chipActive]}
                onPress={() => setRamoMei('')}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, ramoMei === '' && styles.chipTextActive]}>Todos</Text>
              </TouchableOpacity>
              {filtros.ramos_mei.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, ramoMei === r && styles.chipActive]}
                  onPress={() => setRamoMei(ramoMei === r ? '' : r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, ramoMei === r && styles.chipTextActive]} numberOfLines={1}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Município */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>MUNICÍPIO</Text>
          <View style={styles.searchBox}>
            <Feather name="map-pin" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por cidade..."
              placeholderTextColor={colors.textMuted}
              value={municipioInput}
              onChangeText={handleMunicipioChange}
              returnKeyType="search"
              autoCapitalize="words"
            />
            {municipioInput.length > 0 && (
              <TouchableOpacity onPress={clearMunicipio} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contador + clear */}
        {!loading && !error && (
          <View style={styles.counterRow}>
            <Text style={styles.contador}>
              {paginacao.total.toLocaleString('pt-BR')} editais encontrados
            </Text>
            {activeFilters > 0 && (
              <TouchableOpacity
                onPress={() => { setSituacao(''); setRamoMei(''); clearMunicipio(); }}
                style={styles.clearBtn}
              >
                <Feather name="x-circle" size={13} color={colors.accent} />
                <Text style={styles.clearBtnText}>Limpar filtros ({activeFilters})</Text>
              </TouchableOpacity>
            )}
          </View>
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
              isFavorited={favoritedIds.has(item._id)}
              onToggleFavorite={() => toggleFavorite({
                bidId: item._id,
                objeto_compra: item.objeto_compra,
                municipio_nome: item.municipio_nome,
                valor_total_estimado: item.valor_total_estimado,
                situacao_nome: item.situacao_nome,
                ramo_mei: item.ramo_mei,
                modalidade_nome: item.modalidade_nome,
                data_publicacao_pncp: item.data_publicacao_pncp,
              })}
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
              <Text style={[styles.pageBtnText, pagina === 1 && styles.pageBtnTextDisabled]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>{pagina} / {paginacao.paginas}</Text>

            <TouchableOpacity
              style={[styles.pageBtn, pagina === paginacao.paginas && styles.pageBtnDisabled]}
              onPress={() => setPagina(pagina + 1)}
              disabled={pagina === paginacao.paginas}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageBtnText, pagina === paginacao.paginas && styles.pageBtnTextDisabled]}>Próxima</Text>
              <Feather name="chevron-right" size={16} color={pagina === paginacao.paginas ? colors.border : colors.accent} />
            </TouchableOpacity>
          </View>
        )}
          </>
        )}

        {/* Salvos (favoritos) */}
        {view === 'salvos' && (
          favorites.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="bookmark" size={40} color={colors.border} />
              <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
              <Text style={styles.emptySubtitle}>
                Toque no ícone de marcador em qualquer edital para salvá-lo aqui.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {favorites.map(item => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onRemove={() => toggleFavorite({
                    bidId: item.bidId,
                    objeto_compra: item.objeto_compra,
                    municipio_nome: item.municipio_nome,
                    valor_total_estimado: item.valor_total_estimado,
                    situacao_nome: item.situacao_nome,
                    ramo_mei: item.ramo_mei,
                    modalidade_nome: item.modalidade_nome,
                    data_publicacao_pncp: item.data_publicacao_pncp,
                  })}
                />
              ))}
            </View>
          )
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  header: { gap: 6 },
  segmented: {
    flexDirection: 'row', backgroundColor: colors.surfaceAlt,
    borderRadius: 12, padding: 4, gap: 4,
  },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  segText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  segTextActive: { color: colors.text, fontWeight: '700' },
  favCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border,
  },
  favCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favSituacaoBadge: { backgroundColor: '#d1fae5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  favSituacaoText: { fontSize: 11, fontWeight: '700', color: colors.green },
  favObjeto: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  favMeta: { flexDirection: 'row', gap: 12 },
  favMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favMetaText: { fontSize: 12, color: colors.textMuted },
  favValor: { fontSize: 15, fontWeight: '800', color: colors.accent },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  title: { fontSize: 36, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  errorContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  errorText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  paginacao: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 8,
  },
  pageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent,
  },
  pageBtnDisabled: { borderColor: colors.border },
  pageBtnText: { fontSize: 13, fontWeight: '700', color: colors.accent },
  pageBtnTextDisabled: { color: colors.border },
  pageInfo: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
});
