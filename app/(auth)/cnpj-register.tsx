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
import { registerWithCnpj } from '../../src/data/apiService';
import { useAppContext } from '../../src/context/AppContext';

function formatCnpj(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export default function CnpjRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAppContext();
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [confirmarVisible, setConfirmarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nomeEmpresa.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome da empresa.');
      return;
    }
    if (cnpj.replace(/\D/g, '').length !== 14) {
      Alert.alert('CNPJ inválido', 'Digite um CNPJ completo com 14 dígitos.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A confirmação de senha não coincide.');
      return;
    }

    try {
      setLoading(true);
      const data = await registerWithCnpj({ nomeEmpresa, cnpj, email, senha });
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
      if (msg.includes('CNPJ já cadastrado')) {
        Alert.alert('CNPJ já cadastrado', 'Este CNPJ já possui uma conta. Faça login.');
      } else if (msg.includes('E-mail já cadastrado')) {
        Alert.alert('E-mail já cadastrado', 'Este e-mail já possui uma conta. Faça login.');
      } else {
        Alert.alert('Erro no cadastro', 'Não foi possível criar a conta. Tente novamente.');
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
          <Text style={styles.title}>Criar conta empresarial</Text>
          <Text style={styles.subtitle}>
            Cadastre sua empresa para participar de licitações públicas.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Nome da empresa</Text>
            <View style={styles.inputRow}>
              <Feather name="home" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Razão social ou nome fantasia"
                placeholderTextColor={colors.textMuted}
                value={nomeEmpresa}
                onChangeText={setNomeEmpresa}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
          </View>

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
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputRow}>
              <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="contato@empresa.com.br"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!senhaVisible}
                value={senha}
                onChangeText={setSenha}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setSenhaVisible(v => !v)} style={styles.eyeBtn}>
                <Feather name={senhaVisible ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={[styles.inputRow, confirmarSenha && senha !== confirmarSenha && styles.inputRowError]}>
              <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Repita a senha"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!confirmarVisible}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setConfirmarVisible(v => !v)} style={styles.eyeBtn}>
                <Feather name={confirmarVisible ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {confirmarSenha.length > 0 && senha !== confirmarSenha && (
              <Text style={styles.errorText}>As senhas não coincidem</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="user-plus" size={18} color="#fff" />
            }
            <Text style={styles.registerBtnText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/cnpj-login')}>
            <Text style={styles.footerLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, gap: 20 },
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
  title: { fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  form: { gap: 14 },
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
  inputRowError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 2 },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 99,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
