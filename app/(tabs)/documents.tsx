import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert as RNAlert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, ScreenLayout } from '@/src/presentation/components';
import { useAppContext } from '@/src/context/AppContext';
import { UploadedDocument, DocumentUploadStatus } from '@/src/domain/entities';

let _pickDocument: (() => Promise<{ uri: string; name: string; mimeType: string; size?: number } | null>) | null = null;
try {
  const DP = require('expo-document-picker');
  _pickDocument = async () => {
    const result = await DP.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream', size: asset.size };
  };
} catch {}

const STATUS_CONFIG: Record<DocumentUploadStatus, { label: string; bg: string; fg: string; icon: string }> = {
  aprovado: { label: 'Aprovado', bg: '#d1fae5', fg: '#065f46', icon: 'check-circle' },
  pendente: { label: 'Pendente', bg: '#fef3c7', fg: '#92400e', icon: 'clock' },
  rejeitado: { label: 'Rejeitado', bg: '#fee2e2', fg: '#991b1b', icon: 'x-circle' },
};

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { documents, addDocument } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<UploadedDocument | null>(null);

  const pendingCount = documents.filter(d => d.status === 'pendente').length;

  const handleUpload = async () => {
    if (!_pickDocument) {
      RNAlert.alert(
        'Upload indisponível',
        'Instale expo-document-picker para habilitar o upload:\n\nnpx expo install expo-document-picker',
      );
      return;
    }
    try {
      setUploading(true);
      const file = await _pickDocument();
      if (!file) return;
      addDocument({
        id: Date.now().toString(),
        name: file.name,
        mimeType: file.mimeType,
        uploadDate: new Date().toISOString(),
        status: 'pendente',
        uri: file.uri,
        size: file.size,
      });
    } catch {
      RNAlert.alert('Erro', 'Não foi possível fazer o upload. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: UploadedDocument }) => {
    const cfg = STATUS_CONFIG[item.status];
    const isPdf = item.mimeType?.includes('pdf');
    return (
      <TouchableOpacity style={styles.docCard} onPress={() => setPreview(item)} activeOpacity={0.8}>
        <View style={[styles.docIcon, { backgroundColor: isPdf ? '#fee2e2' : '#dbeafe' }]}>
          <Feather name={isPdf ? 'file-text' : 'image'} size={22} color={isPdf ? colors.danger : colors.accent} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.docMeta}>
            <Text style={styles.docDate}>{formatDate(item.uploadDate)}</Text>
            {item.size ? <Text style={styles.docSize}> · {formatSize(item.size)}</Text> : null}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon as any} size={11} color={cfg.fg} />
          <Text style={[styles.statusText, { color: cfg.fg }]}>{cfg.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>
        {pendingCount > 0 && (
          <View style={styles.pendingBanner}>
            <Feather name="alert-circle" size={15} color="#92400e" />
            <Text style={styles.pendingText}>
              {pendingCount} {pendingCount === 1 ? 'documento pendente' : 'documentos pendentes'} de revisão
            </Text>
          </View>
        )}

        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 160 + insets.bottom }]}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.title}>Meus Documentos</Text>
              <Text style={styles.subtitle}>
                {documents.length === 0
                  ? 'Nenhum documento enviado ainda.'
                  : `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={40} color={colors.border} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum documento</Text>
              <Text style={styles.emptySubtitle}>
                Faça upload de PDFs ou imagens necessários para suas licitações.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.uploadBar, { bottom: 92 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="upload" size={20} color="#fff" />
            }
            <Text style={styles.uploadBtnText}>{uploading ? 'Enviando...' : 'Fazer Upload'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!preview} animationType="slide" transparent onRequestClose={() => setPreview(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{preview?.name}</Text>
              <TouchableOpacity onPress={() => setPreview(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {preview && (() => {
              const cfg = STATUS_CONFIG[preview.status];
              return (
                <View style={{ gap: 16 }}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Feather name={cfg.icon as any} size={12} color={cfg.fg} />
                      <Text style={[styles.statusText, { color: cfg.fg }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Enviado em</Text>
                    <Text style={styles.modalValue}>{formatDate(preview.uploadDate)}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Tipo</Text>
                    <Text style={styles.modalValue}>{preview.mimeType}</Text>
                  </View>
                  {preview.size ? (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Tamanho</Text>
                      <Text style={styles.modalValue}>{formatSize(preview.size)}</Text>
                    </View>
                  ) : null}
                  <View style={styles.previewPlaceholder}>
                    <Feather
                      name={preview.mimeType?.includes('pdf') ? 'file-text' : 'image'}
                      size={48}
                      color={colors.border}
                    />
                    <Text style={styles.previewHint}>Pré-visualização não disponível</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  pendingText: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  listHeader: { gap: 4, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 14, fontWeight: '700', color: colors.text },
  docMeta: { flexDirection: 'row', alignItems: 'center' },
  docDate: { fontSize: 11, color: colors.textMuted },
  docSize: { fontSize: 11, color: colors.textMuted },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  uploadBar: { position: 'absolute', left: 20, right: 20 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 99,
    paddingVertical: 16,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 20,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  modalValue: { fontSize: 13, color: colors.text, fontWeight: '500' },
  previewPlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  previewHint: { fontSize: 12, color: colors.textMuted },
});
