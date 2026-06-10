import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../src/presentation/components';
import { loginWithCnpj } from '../../src/data/apiService';
import { useAppContext } from '../../src/context/AppContext';

function formatCnpj(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export default function CnpjLoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAppContext();
  const [cnpj, setCnpj] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      Alert.alert('CNPJ inválido', 'Digite um CNPJ completo com 14 dígitos.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginWithCnpj(cnpj, senha);
      await login(
        {
          uid: data.user.id,
          displayName: data.user.name,
          email: data.user.email,
          photoURL: null,
        },
        data.access_token,
      );
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('inválidos') || msg.includes('401')) {
        Alert.alert('Credenciais incorretas', 'CNPJ ou senha inválidos. Verifique e tente novamente.');
      } else {
        Alert.alert('Erro no login', 'Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.accent} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Feather name="briefcase" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Entrar com CNPJ</Text>
          <Text style={styles.subtitle}>
            Acesse sua conta empresarial com o CNPJ e sua senha cadastrada.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>CNPJ</Text>
            <View style={styles.inputRow}>
              <Feather name="hash" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="00.000.000/0001-00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={cnpj}
                onChangeText={v => setCnpj(formatCnpj(v))}
                returnKeyType="next"
                maxLength={18}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Sua senha"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!senhaVisible}
                value={senha}
                onChangeText={setSenha}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setSenhaVisible(v => !v)} style={styles.eyeBtn}>
                <Feather name={senhaVisible ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="log-in" size={18} color="#fff" />
            }
            <Text style={styles.loginBtnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Feather name="chrome" size={18} color={colors.text} />
          <Text style={styles.googleBtnText}>Entrar com Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/cnpj-register')}>
            <Text style={styles.footerLink}>Cadastre-se com CNPJ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, gap: 24 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  header: { gap: 10 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 30, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  eyeBtn: { padding: 4 },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 99,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
