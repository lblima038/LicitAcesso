import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  Button,
  StatCard,
  EstadoCard,
  AreaCard,
  formatBRL,
  ScreenLayout,
} from '@/src/presentation/components';
import { useDashboardViewModel } from '@/src/presentation/viewmodels';
import { useAppContext } from '@/src/context/AppContext';
import { Proposal, ProposalStatus } from '@/src/domain/entities';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(displayName: string | null): string {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const first = displayName ? displayName.split(' ')[0] : '';
  return first ? `${salutation}, ${first}!` : `${salutation}!`;
}

function getMonthlyData(proposals: Proposal[]) {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const count = proposals.filter(p => {
      const pd = new Date(p.date);
      return pd.getFullYear() === y && pd.getMonth() === m;
    }).length;
    return { month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), count };
  });
}

const PROPOSAL_CFG: Record<ProposalStatus, { label: string; color: string; bg: string }> = {
  em_andamento: { label: 'Em andamento', color: '#92400e', bg: '#fef3c7' },
  ganhou:       { label: 'Ganhou',        color: colors.green,    bg: '#d1fae5' },
  perdeu:       { label: 'Perdeu',        color: colors.danger,   bg: '#fee2e2' },
  cancelado:    { label: 'Cancelado',     color: colors.textMuted, bg: colors.surfaceAlt },
};

const BAR_MAX_H = 72;

function BarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <View style={chartStyles.row}>
      {data.map((item, i) => (
        <View key={i} style={chartStyles.col}>
          <Text style={chartStyles.count}>{item.count > 0 ? item.count : ''}</Text>
          <View style={chartStyles.track}>
            <View style={[chartStyles.bar, { height: Math.max((item.count / max) * BAR_MAX_H, 4) }]} />
          </View>
          <Text style={chartStyles.label}>{item.month}</Text>
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110, paddingHorizontal: 8 },
  col: { alignItems: 'center', gap: 4, flex: 1 },
  count: { fontSize: 11, fontWeight: '700', color: colors.accent, minHeight: 16 },
  track: { width: 32, height: BAR_MAX_H, backgroundColor: colors.surfaceAlt, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  bar: { backgroundColor: colors.accent, borderRadius: 8, width: '100%' },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { statsNacionais, topEstados, topAreas, loading } = useDashboardViewModel();
  const { firebaseUser, proposals } = useAppContext();
  const insets = useSafeAreaInsets();

  const maxEstadoValor = topEstados[0]?.valor_total ?? 1;
  const maxAreaValor = topAreas[0]?.valor_total ?? 1;

  const greeting = getGreeting(firebaseUser?.displayName ?? null);
  const total = proposals.length;
  const won = proposals.filter(p => p.status === 'ganhou').length;
  const inProg = proposals.filter(p => p.status === 'em_andamento').length;
  const rate = total > 0 ? Math.round((won / total) * 100) : 0;
  const monthlyData = getMonthlyData(proposals);

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalized greeting */}
        <View style={styles.section}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.greetingSub}>Acompanhe suas licitações e o mercado nacional.</Text>
        </View>

        {/* Personal summary cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Feather name="file-text" size={18} color={colors.accent} style={styles.summaryIcon} />
            <Text style={styles.summaryNum}>{total}</Text>
            <Text style={styles.summaryLabel}>Participações</Text>
          </View>
          <View style={styles.summaryCard}>
            <Feather name="clock" size={18} color="#92400e" style={styles.summaryIcon} />
            <Text style={[styles.summaryNum, { color: '#92400e' }]}>{inProg}</Text>
            <Text style={styles.summaryLabel}>Em andamento</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#d1fae5' }]}>
            <Feather name="award" size={18} color={colors.green} style={styles.summaryIcon} />
            <Text style={[styles.summaryNum, { color: colors.green }]}>{won}</Text>
            <Text style={styles.summaryLabel}>Ganhas</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#dbeafe' }]}>
            <Feather name="trending-up" size={18} color={colors.accent} style={styles.summaryIcon} />
            <Text style={[styles.summaryNum, { color: colors.accent }]}>{rate}%</Text>
            <Text style={styles.summaryLabel}>Taxa de sucesso</Text>
          </View>
        </View>

        {/* National stat cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsRow}
          contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        >
          <StatCard
            iconName="file-text"
            title={loading ? '...' : statsNacionais.totalLicitacoes.toLocaleString('pt-BR')}
            subtitle="Licitações no período"
            iconBg="#dbeafe"
            iconColor={colors.accent}
          />
          <StatCard
            iconName="dollar-sign"
            title={loading ? '...' : formatBRL(statsNacionais.totalValor)}
            subtitle="Volume total contratado"
            iconBg="#d1fae5"
            iconColor={colors.green}
          />
          <StatCard
            iconName="map"
            title={loading ? '...' : `${statsNacionais.numEstados} estados`}
            subtitle="Com contratos ativos"
            iconBg="#fce7f3"
            iconColor="#be185d"
          />
        </ScrollView>

        {/* Participation history */}
        {proposals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Feather name="list" size={18} color={colors.accent} />
                <Text style={styles.sectionTitle}>Histórico de Participações</Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Participações por mês</Text>
              <BarChart data={monthlyData} />
            </View>

            {proposals.slice(0, 5).map(p => {
              const cfg = PROPOSAL_CFG[p.status];
              return (
                <View key={p.id} style={styles.proposalCard}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.proposalName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.proposalOrg}>{p.organization}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[styles.proposalBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.proposalStatus, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={styles.proposalDate}>
                      {new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Top Estados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="bar-chart-2" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Top Estados por Volume</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/editais')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            topEstados.map((item, i) => (
              <EstadoCard key={`${item.uf}_${i}`} item={item} maxValor={maxEstadoValor} rank={i + 1} />
            ))
          )}
        </View>

        {/* Top Áreas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="layers" size={18} color={colors.green} />
              <Text style={styles.sectionTitle}>Top Áreas de Serviço</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/editais')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            topAreas.map((item, i) => (
              <AreaCard key={`${item.ramo_mei}_${i}`} item={item} maxValor={maxAreaValor} rank={i + 1} />
            ))
          )}
        </View>

        {/* What is an Edital card */}
        <View style={styles.editalInfoCard}>
          <Text style={styles.editalInfoTitle}>O que é um 'Edital'?</Text>
          <Text style={styles.editalInfoText}>
            Regulamento de um concurso público. Diz o que o governo quer comprar, o valor e os documentos necessários.
          </Text>
          <Button
            variant="outline"
            style={{ backgroundColor: '#2f1500', borderWidth: 0, alignSelf: 'flex-start', marginTop: 4 }}
            textStyle={{ color: colors.orange }}
            onPress={() => {}}
          >
            <Text style={{ color: colors.orange, fontWeight: '700', fontSize: 13 }}>Saiba mais →</Text>
          </Button>
          <Feather
            name="help-circle"
            size={96}
            color="rgba(0,0,0,0.07)"
            style={styles.editalInfoIcon}
          />
        </View>

        {/* Support card */}
        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Feather name="help-circle" size={24} color={colors.textMuted} />
          </View>
          <Text style={styles.supportTitle}>Precisa de ajuda?</Text>
          <Text style={styles.supportText}>Nossos especialistas ajudam você com a papelada.</Text>
          <Button
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={{ color: colors.green, fontWeight: '700' }}>Falar com Suporte</Text>
          </Button>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  section: { gap: 12 },
  greeting: { fontSize: 30, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  greetingSub: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
  // Personal summary grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  summaryIcon: { marginBottom: 4 },
  summaryNum: { fontSize: 24, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  // National stats
  statsRow: { marginHorizontal: -20, paddingLeft: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: 13, fontWeight: '700', color: colors.accent },
  loadingText: { color: colors.textMuted, textAlign: 'center', marginTop: 12 },
  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  // Proposal history
  proposalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  proposalName: { fontSize: 14, fontWeight: '700', color: colors.text },
  proposalOrg: { fontSize: 12, color: colors.textMuted },
  proposalBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  proposalStatus: { fontSize: 11, fontWeight: '700' },
  proposalDate: { fontSize: 11, color: colors.textMuted },
  // Info cards
  editalInfoCard: {
    backgroundColor: colors.orange,
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    gap: 8,
  },
  editalInfoTitle: { fontSize: 18, fontWeight: '700', color: '#2f1500' },
  editalInfoText: { fontSize: 13, color: '#5c2c00', lineHeight: 20 },
  editalInfoIcon: { position: 'absolute', bottom: -20, right: -20, transform: [{ rotate: '12deg' }] },
  supportCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  supportTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  supportText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
