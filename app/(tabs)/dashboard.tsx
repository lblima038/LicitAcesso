import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  Button,
  StatCard,
  BidCard,
  ScreenLayout,
} from '../../src/presentation/components';
import { useDashboardViewModel } from '../../src/presentation/viewmodels';

export default function DashboardScreen() {
  const { user, recommendedBids, loading } = useDashboardViewModel();
  const insets = useSafeAreaInsets();

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.section}>
          <Text style={styles.greeting}>Olá, {user?.name || 'Carlos'}!</Text>
          <Text style={styles.greetingSub}>Veja como está o seu negócio hoje.</Text>
        </View>

        {/* Stat cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsRow}
          contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        >
          <StatCard
            iconName="check-circle"
            title="1 Inscrição Ativa"
            subtitle="Manutenção - Pref. de SP"
            iconBg="#dbeafe"
            iconColor={colors.accent}
          />
          <StatCard
            iconName="zap"
            title="3 Oportunidades"
            subtitle="Compatíveis com seu MEI"
            iconBg="#d1fae5"
            iconColor={colors.green}
          />
          <TouchableOpacity style={styles.newSearchCard} activeOpacity={0.8}>
            <Feather name="plus-circle" size={32} color="#fff" />
            <Text style={styles.newSearchText}>Nova Busca</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recommended bids */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="star" size={18} color={colors.green} />
              <Text style={styles.sectionTitle}>Oportunidades Ideais</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/editais')}>
              <Text style={styles.sectionLink}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>
              Carregando...
            </Text>
          ) : (
            recommendedBids.map(bid => <BidCard key={bid.id} bid={bid} />)
          )}
        </View>

        {/* What is an Edital card */}
        <View style={styles.editalInfoCard}>
          <Text style={styles.editalInfoTitle}>O que é um 'Edital'?</Text>
          <Text style={styles.editalInfoText}>
            Regulamento de um concurso público. Diz o que o governo quer comprar, o valor e documentos.
          </Text>
          <Button
            variant="outline"
            style={{ backgroundColor: '#2f1500', borderWidth: 0, alignSelf: 'flex-start', marginTop: 4 }}
            textStyle={{ color: colors.orange }}
            onPress={() => {}}
          >
            <Text style={{ color: colors.orange, fontWeight: '700', fontSize: 13 }}>
              Saiba mais →
            </Text>
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
  section: { gap: 16 },
  greeting: { fontSize: 34, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  greetingSub: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  statsRow: { marginHorizontal: -20, paddingLeft: 20 },
  newSearchCard: {
    width: 160,
    height: 110,
    backgroundColor: colors.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newSearchText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: 13, fontWeight: '700', color: colors.accent },
  editalInfoCard: {
    backgroundColor: colors.orange,
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    gap: 8,
  },
  editalInfoTitle: { fontSize: 18, fontWeight: '700', color: '#2f1500' },
  editalInfoText: { fontSize: 13, color: '#5c2c00', lineHeight: 20 },
  editalInfoIcon: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    transform: [{ rotate: '12deg' }],
  },
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
