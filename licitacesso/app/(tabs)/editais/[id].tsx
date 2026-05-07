import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, Button } from '../../../src/presentation/components';
import { useBidDetailViewModel } from '../../../src/presentation/viewmodels';

export default function EditalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bid, loading } = useBidDetailViewModel(id ?? '');
  const insets = useSafeAreaInsets();

  if (loading || !bid) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Carregando edital...</Text>
      </View>
    );
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(bid.estimatedValue);

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
            <View style={styles.requirementList}>
              <View style={styles.requirementItem}>
                <Feather name="check-circle" size={18} color={colors.green} />
                <Text style={styles.requirementText}>Ter MEI ativo com CNAE compatível.</Text>
              </View>
              <View style={styles.requirementItem}>
                <Feather name="check-circle" size={18} color={colors.green} />
                <Text style={styles.requirementText}>
                  Apresentar Certidão Negativa (nós ajudamos).
                </Text>
              </View>
            </View>
          </View>

          {/* Prazo */}
          <View style={[styles.card, { backgroundColor: colors.orange }]}>
            <Text style={[styles.cardTitle, { color: colors.orangeDark }]}>Prazo de entrega</Text>
            <View style={styles.deadlineRow}>
              <View>
                <Text style={styles.deadlineLabel}>DATA LIMITE</Text>
                <Text style={styles.deadlineValue}>{bid.deadline}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.deadlineLabel}>HORÁRIO</Text>
                <Text style={styles.deadlineValue}>14:00h</Text>
              </View>
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
  },
  loadingText: { color: colors.textMuted, fontSize: 16 },
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
