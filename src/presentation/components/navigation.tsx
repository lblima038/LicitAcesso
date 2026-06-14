/**
 * presentation/components/navigation.tsx
 * Chrome de navegação: barra superior, barra inferior e wrapper de tela.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { colors } from '../theme';
import { useAppContext } from '../../context/AppContext';

// ─── BottomTabBar ─────────────────────────────────────────────────────────────
interface TabItem {
  route: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  hasBadge?: boolean;
}

const tabItems: TabItem[] = [
  { route: '/(tabs)/dashboard', icon: 'home', label: 'Início' },
  { route: '/(tabs)/editais', icon: 'search', label: 'Editais' },
  { route: '/(tabs)/documents', icon: 'file-text', label: 'Docs' },
  { route: '/(tabs)/alerts', icon: 'bell', label: 'Alertas', hasBadge: true },
  { route: '/(tabs)/profile', icon: 'user', label: 'Perfil' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { unreadAlerts } = useAppContext();

  return (
    <View style={[styles.tabBar, { bottom: insets.bottom + 12, paddingBottom: 10 }]}>
      {tabItems.map(item => {
        const isActive = pathname.startsWith(item.route.replace('/(tabs)', ''));
        const showBadge = item.hasBadge && unreadAlerts > 0;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={{ position: 'relative' }}>
              <Feather
                name={item.icon}
                size={20}
                color={isActive ? '#fff' : `${colors.primary}80`}
              />
              {showBadge && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>
                    {unreadAlerts > 9 ? '9+' : String(unreadAlerts)}
                  </Text>
                </View>
              )}
            </View>
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
      <Text style={styles.topBarTitle}>LicitAcesso</Text>
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

const styles = StyleSheet.create({
  // TopBar
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${colors.background}f0`,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
    fontStyle: 'italic',
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
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
