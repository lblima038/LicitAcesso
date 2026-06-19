/**
 * presentation/components/cards.tsx
 * Cards de conteúdo: estatísticas, editais, rankings + estados de lista.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Bid } from '../../domain/entities';
import { colors, typography } from '../theme';
import { Button } from './Button';
import { formatBRL } from './format';

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({ iconName, title, subtitle, iconBg = '#dbeafe', iconColor = colors.accent }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Feather name={iconName} size={20} color={iconColor} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ─── BidCard ──────────────────────────────────────────────────────────────────
export function BidCard({ bid }: { bid: Bid }) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(bid.estimatedValue);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.bidCard}
      onPress={() => router.push(`/editais/${bid.id}`)}
    >
      <View style={styles.bidImageWrapper}>
        <Image
          source={{ uri: `https://picsum.photos/seed/${bid.id}/400/300` }}
          style={styles.bidImage}
        />
        {bid.matchPercentage ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{bid.matchPercentage}% MATCH</Text>
          </View>
        ) : null}
        {bid.isUrgent ? (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>URGENTE</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bidBody}>
        <View style={styles.bidLocationRow}>
          <Feather name="map-pin" size={11} color={colors.textMuted} />
          <Text style={styles.bidLocation}> {bid.location}</Text>
        </View>
        <Text style={styles.bidTitle}>{bid.title}</Text>
        <Text style={styles.bidDesc} numberOfLines={2}>{bid.description}</Text>

        <View style={styles.bidFooter}>
          <View>
            <Text style={[typography.tiny, { color: colors.textMuted }]}>VALOR ESTIMADO</Text>
            <Text style={styles.bidValue}>{formattedValue}</Text>
          </View>
          <Button
            variant="primary"
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            onPress={() => router.push(`/editais/${bid.id}`)}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Detalhes</Text>
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  subtitle: string;
  iconName?: keyof typeof Feather.glyphMap;
}

export function EmptyState({ title, subtitle, iconName = 'search' }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Feather name={iconName} size={36} color={colors.border} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

// ─── BidCardSkeleton ──────────────────────────────────────────────────────────
export function BidCardSkeleton() {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.bidCard, { opacity: anim, marginBottom: 16 }]}>
      <View style={[styles.skeletonBlock, { height: 160 }]} />
      <View style={{ padding: 16, gap: 10 }}>
        <View style={[styles.skeletonBlock, { height: 12, width: '40%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 18, width: '80%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 14, width: '95%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 14, width: '70%', borderRadius: 6 }]} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <View style={[styles.skeletonBlock, { height: 24, width: '35%', borderRadius: 6 }]} />
          <View style={[styles.skeletonBlock, { height: 36, width: '30%', borderRadius: 12 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── EditalCard ───────────────────────────────────────────────────────────────
interface EditalItem {
  _id?: string;
  ano_compra: number;
  data_publicacao_pncp: string;
  modalidade_nome: string;
  municipio_nome: string;
  objeto_compra: string;
  ramo_mei: string;
  valor_total_estimado: number;
  situacao_nome: string;
}

// Cores do badge de situação por status do edital.
export function situacaoStyle(nome?: string | null): { bg: string; fg: string } {
  const s = (nome ?? '').toLowerCase();
  if (s.includes('divulgad')) return { bg: '#d1fae5', fg: colors.green };      // verde — ativo
  if (s.includes('suspens')) return { bg: '#fef3c7', fg: '#92400e' };          // âmbar — atenção
  if (s.includes('revogad')) return { bg: '#fee2e2', fg: colors.danger };      // vermelho — encerrado
  if (s.includes('anulad')) return { bg: '#ede9fe', fg: '#6d28d9' };           // roxo — anulado
  return { bg: '#dbeafe', fg: colors.accent };                                 // azul — padrão
}

interface EditalCardProps {
  item: EditalItem;
  onPress?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export function EditalCard({ item, onPress, isFavorited, onToggleFavorite }: EditalCardProps) {
  const dataFmt = (() => {
    try {
      return new Date(item.data_publicacao_pncp).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return item.data_publicacao_pncp;
    }
  })();
  const sit = situacaoStyle(item.situacao_nome);

  return (
    <TouchableOpacity
      style={styles.editalCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.editalCardHeader}>
        <View style={[styles.editalSituacaoBadge, { backgroundColor: sit.bg }]}>
          <Text style={[styles.editalSituacaoText, { color: sit.fg }]}>{item.situacao_nome ?? '—'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.editalData}>{dataFmt}</Text>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={onToggleFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Feather
                name="bookmark"
                size={18}
                color={isFavorited ? colors.accent : colors.border}
                style={isFavorited ? { opacity: 1 } : { opacity: 0.5 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.editalObjeto} numberOfLines={3}>{item.objeto_compra}</Text>
      <View style={styles.editalMeta}>
        <View style={styles.editalMetaItem}>
          <Feather name="map-pin" size={11} color={colors.textMuted} />
          <Text style={styles.editalMetaText}>{item.municipio_nome}</Text>
        </View>
        <View style={styles.editalMetaItem}>
          <Feather name="layers" size={11} color={colors.textMuted} />
          <Text style={styles.editalMetaText}>{item.modalidade_nome}</Text>
        </View>
      </View>
      <View style={styles.editalFooter}>
        <Text style={styles.editalRamo}>{item.ramo_mei}</Text>
        <Text style={styles.editalValor}>
          {item.valor_total_estimado != null
            ? item.valor_total_estimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'Não informado'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── EstadoCard ───────────────────────────────────────────────────────────────
interface EstadoItem {
  uf: string;
  total_contratacoes: number;
  valor_total: number;
  orgaos_distintos: number;
}

export function EstadoCard({ item, maxValor, rank }: { item: EstadoItem; maxValor: number; rank: number }) {
  const pct = maxValor > 0 ? item.valor_total / maxValor : 0;
  return (
    <View style={styles.rankCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankNum}>#{rank}</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.rankRow}>
          <Text style={styles.rankTitle}>{item.uf}</Text>
          <Text style={styles.rankValue}>{formatBRL(item.valor_total)}</Text>
        </View>
        <View style={styles.rankBarBg}>
          <View style={{ flexGrow: pct, height: 6, backgroundColor: colors.accent, borderRadius: 3 }} />
          <View style={{ flexGrow: Math.max(1 - pct, 0), height: 6 }} />
        </View>
        <Text style={styles.rankSub}>
          {item.total_contratacoes.toLocaleString('pt-BR')} licitações · {item.orgaos_distintos} órgãos
        </Text>
      </View>
    </View>
  );
}

// ─── AreaCard ─────────────────────────────────────────────────────────────────
interface AreaItem {
  ramo_mei: string;
  total_contratacoes: number;
  valor_total: number;
  orgaos_distintos: number;
}

export function AreaCard({ item, maxValor, rank }: { item: AreaItem; maxValor: number; rank: number }) {
  const pct = maxValor > 0 ? item.valor_total / maxValor : 0;
  return (
    <View style={styles.rankCard}>
      <View style={[styles.rankBadge, { backgroundColor: '#d1fae5' }]}>
        <Text style={[styles.rankNum, { color: colors.green }]}>#{rank}</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.rankRow}>
          <Text style={[styles.rankTitle, { flex: 1, flexWrap: 'wrap' }]}>{item.ramo_mei}</Text>
          <Text style={styles.rankValue}>{formatBRL(item.valor_total)}</Text>
        </View>
        <View style={styles.rankBarBg}>
          <View style={{ flexGrow: pct, height: 6, backgroundColor: colors.green, borderRadius: 3 }} />
          <View style={{ flexGrow: Math.max(1 - pct, 0), height: 6 }} />
        </View>
        <Text style={styles.rankSub}>
          {item.total_contratacoes.toLocaleString('pt-BR')} licitações · {item.orgaos_distintos} órgãos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // StatCard
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  statSubtitle: { fontSize: 13, color: colors.textMuted },
  // BidCard (+ Skeleton)
  bidCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  bidImageWrapper: { position: 'relative' },
  bidImage: { width: '100%', height: 160, resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bidBody: { padding: 16, gap: 6 },
  bidLocationRow: { flexDirection: 'row', alignItems: 'center' },
  bidLocation: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  bidTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  bidDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  bidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  bidValue: { fontSize: 20, fontWeight: '800', color: colors.accent },
  skeletonBlock: { backgroundColor: colors.border, borderRadius: 12 },
  // EmptyState
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  // EditalCard
  editalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editalSituacaoBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editalSituacaoText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.green,
  },
  editalData: {
    fontSize: 11,
    color: colors.textMuted,
  },
  editalObjeto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  editalMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  editalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editalMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  editalFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  editalRamo: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  editalValor: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  // RankCard (EstadoCard / AreaCard)
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rankTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  rankBarBg: {
    flexDirection: 'row',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
