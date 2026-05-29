import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../src/presentation/components';
import { useEditalDetalheViewModel } from '../../../src/presentation/viewmodels';

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

export default function EditalDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { edital, loading, error, retry } = useEditalDetalheViewModel(id ?? '');
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Carregando edital...</Text>
      </View>
    );
  }

  if (error || !edital) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={44} color={colors.danger} />
        <Text style={styles.errorText}>{error ?? 'Edital não encontrado.'}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <TouchableOpacity onPress={retry} style={styles.btnPrimary} activeOpacity={0.8}>
            <Feather name="refresh-cw" size={15} color="#fff" />
            <Text style={styles.btnPrimaryText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.btnOutline} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const dataFmt = (() => {
    try {
      return new Date(edital.data_publicacao_pncp).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch {
      return edital.data_publicacao_pncp;
    }
  })();

  const valorFmt = edital.valor_total_estimado != null
    ? edital.valor_total_estimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Não informado';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Topo */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.situacaoBadge}>
            <Text style={styles.situacaoText}>{edital.situacao_nome ?? '—'}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>{edital.objeto_compra}</Text>
        <Text style={styles.dataPublicacao}>Publicado em {dataFmt}</Text>

        {/* Valor destaque */}
        <View style={styles.valorCard}>
          <View style={styles.valorCardHeader}>
            <View style={styles.valorIcon}>
              <Feather name="dollar-sign" size={18} color="#fff" />
            </View>
            <Text style={styles.valorLabel}>Valor Total Estimado</Text>
          </View>
          <Text style={styles.valorText}>{valorFmt}</Text>
          <Text style={styles.valorNote}>Pagamento garantido pelo governo.</Text>
        </View>

        {/* Informações gerais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Gerais</Text>
          <InfoRow label="Modalidade" value={edital.modalidade_nome} />
          <InfoRow label="Ano da compra" value={edital.ano_compra} />
          <InfoRow label="Município" value={edital.municipio_nome} />
          <InfoRow label="UF" value={edital.uf} />
          <InfoRow label="Órgão" value={edital.razao_social ?? edital.orgao_entidade} />
          <InfoRow label="Unidade" value={edital.unidade_nome} />
          <InfoRow label="Nº do processo" value={edital.numero_processo} />
          <InfoRow label="Nº da compra" value={edital.numero_compra} />
        </View>

        {/* Área de atuação */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Área de Atuação</Text>
          <InfoRow label="Ramo MEI" value={edital.ramo_mei} />
          <InfoRow label="Tipo de objeto" value={edital.tipo_objeto} />
        </View>

        {/* Datas */}
        <View style={[styles.card, { backgroundColor: colors.orange }]}>
          <Text style={[styles.cardTitle, { color: colors.orangeDark }]}>Datas</Text>
          <InfoRow label="Publicação PNCP" value={dataFmt} />
          <InfoRow label="Abertura de propostas" value={edital.data_abertura_proposta} />
          <InfoRow label="Encerramento" value={edital.data_encerramento_proposta} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { fontSize: 16, color: colors.textMuted },
  errorText: { fontSize: 15, color: colors.text, textAlign: 'center', fontWeight: '600' },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  btnOutline: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  container: { paddingHorizontal: 20, gap: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  situacaoBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  situacaoText: { fontSize: 12, fontWeight: '700', color: colors.green },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  dataPublicacao: { fontSize: 13, color: colors.textMuted },
  valorCard: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  valorCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  valorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  valorText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  valorNote: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 13, color: colors.textMuted, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 2, textAlign: 'right' },
});
