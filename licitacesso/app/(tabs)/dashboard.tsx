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
} from '../../src/presentation/components';
import { useDashboardViewModel } from '../../src/presentation/viewmodels';

export default function DashboardScreen() {
  const { statsNacionais, topEstados, topAreas, loading } = useDashboardViewModel();
  const insets = useSafeAreaInsets();

  const maxEstadoValor = topEstados[0]?.valor_total ?? 1;
  const maxAreaValor = topAreas[0]?.valor_total ?? 1;

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.section}>
          <Text style={styles.greeting}>Panorama</Text>
          <Text style={styles.greetingSub}>Mercado nacional de licitações públicas.</Text>
        </View>

        {/* Stat cards */}
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
              <EstadoCard key={item.uf} item={item} maxValor={maxEstadoValor} rank={i + 1} />
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
              <AreaCard key={item.ramo_mei} item={item} maxValor={maxAreaValor} rank={i + 1} />
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
  section: { gap: 12 },
  greeting: { fontSize: 34, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  greetingSub: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  statsRow: { marginHorizontal: -20, paddingLeft: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: 13, fontWeight: '700', color: colors.accent },
  loadingText: { color: colors.textMuted, textAlign: 'center', marginTop: 12 },
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
