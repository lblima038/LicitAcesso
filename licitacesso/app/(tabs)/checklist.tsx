import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, Button, ScreenLayout } from '../../src/presentation/components';
import { useChecklistViewModel } from '../../src/presentation/viewmodels';
import { DocumentStatus } from '../../src/domain/entities';

export default function ChecklistScreen() {
  const { documents, progress, loading, error } = useChecklistViewModel('1');
  const insets = useSafeAreaInsets();
  const okCount = documents.filter(d => d.status === DocumentStatus.OK).length;

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Checklist de Documentos</Text>
        <Text style={styles.subtitle}>Pregão Eletrônico nº 042/2023 - Manutenção Predial</Text>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Status da Habilitação</Text>
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <Text style={styles.progressCount}>{okCount} de {documents.length} documentos</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Documents */}
        {loading ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>
            Carregando...
          </Text>
        ) : error ? (
          <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 20 }}>
            {error}
          </Text>
        ) : (
          <View style={styles.docList}>
            {documents.map(doc => (
              <View
                key={doc.id}
                style={[
                  styles.docItem,
                  {
                    borderLeftColor:
                      doc.status === DocumentStatus.OK
                        ? '#8af5be'
                        : doc.status === DocumentStatus.PENDING
                        ? colors.orange
                        : colors.border,
                  },
                ]}
              >
                <View style={styles.docIcon}>
                  <Feather name="file-text" size={22} color={colors.text} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSub}>
                    {doc.lastUpdated ? `Atualizado em ${doc.lastUpdated}` : doc.description}
                  </Text>
                </View>
                <View>
                  {doc.status === DocumentStatus.OK ? (
                    <View style={styles.statusOk}>
                      <Feather name="check-circle" size={16} color={colors.green} />
                      <Text style={styles.statusOkText}>OK</Text>
                    </View>
                  ) : doc.status === DocumentStatus.PENDING ? (
                    <Button
                      variant="outline"
                      style={{ paddingHorizontal: 14, paddingVertical: 7 }}
                      onPress={() => doc.actionUrl && Linking.openURL(doc.actionUrl)}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                        Emitir
                      </Text>
                    </Button>
                  ) : (
                    <Text style={styles.statusProcessing}>Processando...</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  title: { fontSize: 28, fontWeight: '900', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textMuted },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  progressValue: { fontSize: 40, fontWeight: '900', color: colors.green },
  progressCount: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  progressTrack: {
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 5,
  },
  docList: { gap: 12 },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  docSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusOk: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusOkText: { fontSize: 13, fontWeight: '700', color: colors.green },
  statusProcessing: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
});
