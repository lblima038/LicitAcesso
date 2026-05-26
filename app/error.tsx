import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, Button } from '../src/presentation/components';

export default function ErrorScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconWrapper}>
        <Feather name="cloud-off" size={48} color={colors.danger} />
      </View>
      <Text style={styles.title}>Ops, algo deu errado</Text>
      <Text style={styles.body}>
        Não conseguimos carregar as informações. Verifique sua conexão ou tente novamente.
      </Text>
      <Button
        variant="primary"
        style={styles.button}
        onPress={() => router.replace('/(tabs)/dashboard')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Tentar Novamente</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 16,
  },
});
