import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, ScreenLayout } from '../../src/presentation/components';
import { useAppContext } from '../../src/context/AppContext';

export default function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const { firebaseUser, proposals, logout } = useAppContext();

  const displayName = firebaseUser?.displayName ?? 'Usuário';
  const email = firebaseUser?.email ?? '';
  const photoURL = firebaseUser?.photoURL ?? null;

  const total = proposals.length;
  const won = proposals.filter(p => p.status === 'ganhou').length;
  const inProgress = proposals.filter(p => p.status === 'em_andamento').length;
  const rate = total > 0 ? Math.round((won / total) * 100) : 0;

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & name */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {!!email && <Text style={styles.email}>{email}</Text>}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>Participações</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{won}</Text>
            <Text style={styles.statLabel}>Ganhas</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{inProgress}</Text>
            <Text style={styles.statLabel}>Andamento</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.green }]}>{rate}%</Text>
            <Text style={styles.statLabel}>Sucesso</Text>
          </View>
        </View>

        {/* Account menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Conta</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="user" label="Perfil Empresarial" onPress={() => router.push('/profile')} />
            <Separator />
            <MenuItem icon="lock" label="Alterar Senha" onPress={() => router.push('/change-password')} />
            <Separator />
            <MenuItem icon="bell" label="Alertas e Prazos" onPress={() => router.push('/(tabs)/alerts')} />
          </View>
        </View>

        {/* Tools menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ferramentas</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="check-square" label="Checklist de Inscrição" onPress={() => router.push('/(tabs)/checklist')} />
            <Separator />
            <MenuItem icon="message-square" label="Suporte" onPress={() => router.push('/(tabs)/chat')} />
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress(): void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrap}>
        <Feather name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrapper: { position: 'relative', marginBottom: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.accent },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },
  statSep: { width: 1, backgroundColor: colors.border },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 64 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 16,
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
