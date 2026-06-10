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
import { colors } from '@/src/presentation/components';
import { signInWithGoogle } from '@/src/data/authService';
import { useAppContext } from '@/src/context/AppContext';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const authUser = await signInWithGoogle();

      // Troca idToken do Google pelo JWT interno do backend
      let accessToken: string | undefined;
      const res = await fetch('https://licitacessobackend.onrender.com/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: authUser.idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        accessToken = data.access_token;
      }

      await login(
        {
          uid: authUser.uid,
          displayName: authUser.name,
          email: authUser.email,
          photoURL: authUser.photoUrl,
        },
        accessToken,
      );
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      if (err?.type === 'cancelled') return;
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
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
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.accent} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Crie sua conta para começar a participar de licitações públicas com mais facilidade.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Feather name="chrome" size={20} color={colors.text} />
          )}
          <Text style={styles.googleButtonText}>
            {loading ? 'Aguarde...' : 'Cadastrar com Google'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.cnpjButton}
          onPress={() => router.push('/(auth)/cnpj-register')}
          activeOpacity={0.85}
        >
          <Feather name="briefcase" size={20} color="#fff" />
          <Text style={styles.cnpjButtonText}>Cadastrar com CNPJ</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Entrar</Text>
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
  header: { gap: 8 },
  title: { fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  googleButtonText: { fontSize: 15, fontWeight: '700', color: colors.text },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  cnpjButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },
  cnpjButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
