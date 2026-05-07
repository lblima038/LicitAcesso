/**
 * presentation/components.tsx
 * Componentes reutilizáveis — versão React Native do LicitAcesso.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Bid } from '../domain/entities';

// ─── Paleta de cores ──────────────────────────────────────────────────────────
export const colors = {
  primary: '#003d9b',
  primaryDark: '#002a6b',
  accent: '#0052cc',
  green: '#006c47',
  greenLight: '#8af5be',
  orange: '#ffdcc3',
  orangeDark: '#6a3600',
  background: '#f8f9fb',
  surface: '#ffffff',
  surfaceAlt: '#f3f4f6',
  border: '#e2e5ec',
  text: '#191c1e',
  textMuted: '#434654',
  danger: '#ba1a1a',
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.primary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  label: { fontSize: 12, fontWeight: '700' as const, color: colors.textMuted },
  tiny: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1 },
};

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const buttonVariants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.accent },
    text: { color: '#fff' },
  },
  secondary: {
    container: { backgroundColor: colors.greenLight },
    text: { color: colors.green },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#737685' },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.accent },
  },
};

export function Button({ children, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.buttonBase, v.container, style, disabled && { opacity: 0.5 }]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.buttonText, v.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

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

// ─── BottomTabBar ─────────────────────────────────────────────────────────────
const tabItems = [
  { route: '/(tabs)/dashboard', icon: 'home' as const, label: 'Início' },
  { route: '/(tabs)/editais', icon: 'search' as const, label: 'Editais' },
  { route: '/(tabs)/checklist', icon: 'check-square' as const, label: 'Inscrições' },
  { route: '/(tabs)/chat', icon: 'message-square' as const, label: 'Suporte' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {tabItems.map(item => {
        const isActive = pathname.startsWith(item.route.replace('/(tabs)', ''));
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Feather
              name={item.icon}
              size={22}
              color={isActive ? '#fff' : `${colors.primary}80`}
            />
            <Text style={[styles.tabLabel, isActive && { color: '#fff' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
export function TopBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBarLeft}>
        <Feather name="menu" size={22} color={colors.accent} />
        <Text style={styles.topBarTitle}>LicitAcesso</Text>
      </View>
      <View style={styles.topBarRight}>
        <Feather name="bell" size={20} color={colors.accent} />
        <View style={styles.topBarAvatar}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/a/default-user' }}
            style={{ width: 36, height: 36 }}
          />
        </View>
      </View>
    </View>
  );
}

// ─── ScreenLayout ─────────────────────────────────────────────────────────────
interface ScreenLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar />
      {children}
      <BottomTabBar />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
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
  // BidCard
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
  // TopBar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${colors.background}f0`,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
    fontStyle: 'italic',
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topBarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#dae2ff',
  },
  // BottomTabBar
  tabBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: `${colors.primary}80`,
  },
});
