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
import { colors, Button } from '../../../src/presentation/components';
import { useBidDetailViewModel } from '../../../src/presentation/viewmodels';

export default function EditalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bid, loading, error, retry } = useBidDetailViewModel(id ?? '');
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Carregando edital...</Text>
      </View>
    );
  }

  if (error || !bid) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={44} color={colors.danger} />
        <Text style={styles.errorTitle}>{error ?? 'Edital não encontrado.'}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          {error && (
            <TouchableOpacity onPress={retry} style={styles.retryButton} activeOpacity={0.8}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.back()} style={styles.backTextButton} activeOpacity={0.8}>
            <Text style={styles.backTextButtonLabel}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(bid.estimatedValue);

  const requirements = bid.requirements ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Tag */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.tag}>EDITAL SIMPLIFICADO</Text>
        </View>

        <Text style={styles.title}>{bid.title}</Text>

        {/* Cards grid */}
        <View style={styles.grid}>
          {/* O que é */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#dbeafe' }]}>
                <Feather name="help-circle" size={18} color={colors.accent} />
              </View>
              <Text style={styles.cardTitle}>O que é?</Text>
            </View>
            <Text style={styles.cardBody}>{bid.description}</Text>
          </View>

          {/* Quanto pagam */}
          <View style={[styles.card, { backgroundColor: colors.accent }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name="dollar-sign" size={18} color="#fff" />
              </View>
              <Text style={[styles.cardTitle, { color: '#fff' }]}>Quanto pagam?</Text>
            </View>
            <Text style={styles.valueText}>{formattedValue}</Text>
            <Text style={styles.valueNote}>Pagamento garantido pelo governo local.</Text>
          </View>

          {/* O que preciso */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.green }]}>
            <Text style={styles.cardTitle}>O que preciso fazer?</Text>
            {requirements.length > 0 ? (
              <View style={styles.requirementList}>
                {requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Feather name="check-circle" size={18} color={colors.green} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.cardBody}>Consulte o edital completo para mais detalhes.</Text>
            )}
          </View>

          {/* Prazo */}
          <View style={[styles.card, { backgroundColor: colors.orange }]}>
            <Text style={[styles.cardTitle, { color: colors.orangeDark }]}>Prazo de entrega</Text>
            <View style={styles.deadlineRow}>
              <View>
                <Text style={styles.deadlineLabel}>DATA LIMITE</Text>
                <Text style={styles.deadlineValue}>{bid.deadline}</Text>
              </View>
              {bid.deadlineTime && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.deadlineLabel}>HORÁRIO</Text>
                  <Text style={styles.deadlineValue}>{bid.deadlineTime}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* CTA */}
        <Button
          variant="primary"
          style={styles.ctaButton}
          onPress={() => router.push('/checklist')}
        >
          <Text style={styles.ctaText}>Participar agora</Text>
          <Feather name="zap" size={20} color="#fff" />
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: colors.textMuted, fontSize: 16 },
  errorTitle: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center', paddingHorizontal: 32 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  backTextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  backTextButtonLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  container: { paddingHorizontal: 20, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.green,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  grid: { gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  valueText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  valueNote: { fontSize: 12, color: '#bfdbfe', fontStyle: 'italic' },
  requirementList: { gap: 10 },
  requirementItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  requirementText: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  deadlineLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: `${colors.orangeDark}99`,
  },
  deadlineValue: { fontSize: 22, fontWeight: '900', color: colors.orangeDark },
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
  },
  ctaText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
