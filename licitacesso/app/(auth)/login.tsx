import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, Button } from '../../src/presentation/components';
import { signInWithGoogle, statusCodes } from '../../src/data/authService';
import { useAppContext } from '../../src/context/AppContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const authUser = await signInWithGoogle();

      // Troca o idToken do Firebase pelo JWT interno do backend
      let accessToken: string | undefined;
      const backendUrl = API_BASE_URL || 'https://licitacessobackend.onrender.com';
      const res = await fetch(`${backendUrl}/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: authUser.idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        accessToken = data.access_token;
      }

      // Persiste usuário + token no contexto e AsyncStorage
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
    } catch (error: unknown) {
      const e = error as { type?: string; code?: string | number; message?: string };
      console.log('[Google Login Error]', JSON.stringify(e));
      if (e?.type === 'cancelled') return;
      if (e?.code === statusCodes.IN_PROGRESS) return;
      if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Erro', 'Google Play Services não disponível neste dispositivo.');
        return;
      }
      const detail = e?.message ?? (e?.code ? `código ${e.code}` : 'erro desconhecido');
      Alert.alert('Erro no login', `Não foi possível entrar com Google.\n\n${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1400&auto=format&fit=crop' }}
        style={styles.hero}
        imageStyle={{ opacity: 0.35 }}
      >
        <View style={[styles.heroContent, { paddingTop: insets.top + 24 }]}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>PLATAFORMA OFICIAL</Text>
          </View>
          <Text style={styles.heroTitle}>LicitAcesso</Text>
          <Text style={styles.heroSubtitle}>Simplificamos a sua participação em licitações públicas</Text>
          <View style={styles.heroDivider} />
        </View>
      </ImageBackground>

      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.welcomeTitle}>Bem-vindo</Text>
        <Text style={styles.welcomeSubtitle}>
          Acesse sua conta para gerenciar editais, acompanhar inscrições e impulsionar seu negócio.
        </Text>

        <View style={styles.buttonGroup}>
          <Button variant="outline" style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color={colors.text} />
              : <Feather name="chrome" size={20} color={colors.text} />
            }
            <Text style={styles.googleBtnText}>{loading ? 'Entrando...' : 'Entrar com Google'}</Text>
          </Button>

          <Button
            variant="secondary"
            style={styles.cnpjBtn}
            onPress={() => router.push('/(auth)/cnpj-login')}
          >
            <View style={styles.cnpjIcon}>
              <Feather name="briefcase" size={16} color="#fff" />
            </View>
            <Text style={styles.cnpjBtnText}>Login com CNPJ</Text>
            <Feather name="arrow-right" size={18} color={colors.green} style={{ marginLeft: 'auto' }} />
          </Button>
        </View>

        <TouchableOpacity
          style={styles.devBtn}
          onPress={async () => {
            await login({ uid: 'dev-user', displayName: 'Usuário Teste', email: 'teste@licitacesso.com', photoURL: null });
            router.replace('/(tabs)/dashboard');
          }}
        >
          <Text style={styles.devBtnText}>⚡ Entrar como visitante (dev)</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: { height: 280, justifyContent: 'flex-end', backgroundColor: colors.primary },
  heroContent: { padding: 28, gap: 12 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 48, fontWeight: '900', color: '#fff', fontStyle: 'italic', letterSpacing: -1 },
  heroSubtitle: { fontSize: 16, color: '#bfdbfe', fontWeight: '500', lineHeight: 24 },
  heroDivider: { width: 48, height: 4, backgroundColor: '#8df7c1', borderRadius: 2, marginTop: 8 },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    gap: 16,
  },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: colors.primary },
  welcomeSubtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  buttonGroup: { gap: 14, marginTop: 8 },
  googleBtn: { width: '100%', height: 52, borderRadius: 99, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  cnpjBtn: { width: '100%', paddingVertical: 16, borderRadius: 99, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cnpjIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cnpjBtnText: { fontSize: 15, fontWeight: '700', color: colors.green },
  devBtn: { alignItems: 'center', paddingVertical: 10 },
  devBtnText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
