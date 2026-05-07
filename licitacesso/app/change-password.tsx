import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, Button, ScreenLayout } from '../src/presentation/components';

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
          placeholder="••••••••"
          placeholderTextColor={`${colors.textMuted}60`}
        />
        <Feather
          name={show ? 'eye-off' : 'eye'}
          size={18}
          color={colors.textMuted}
          onPress={() => setShow(s => !s)}
        />
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const insets = useSafeAreaInsets();

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrapper}>
          <Feather name="lock" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Alterar Senha</Text>
        <Text style={styles.subtitle}>Mantenha sua conta segura com uma senha forte.</Text>

        <View style={styles.form}>
          <PasswordField label="Senha Atual" value={current} onChange={setCurrent} />
          <PasswordField label="Nova Senha" value={next} onChange={setNext} />
          <PasswordField label="Confirmar Nova Senha" value={confirm} onChange={setConfirm} />
        </View>

        <Button
          variant="primary"
          style={styles.saveButton}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Salvar Nova Senha</Text>
        </Button>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 8 },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.primary },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 24,
  },
});
