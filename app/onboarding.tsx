import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, Button } from '../src/presentation/components';
import {
  GoogleSigninButton,
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); 
      const response = await GoogleSignin.signIn();
   if (isSuccessResponse(response)) {
        // Pega os dados reais vindos do Google
        const user = response.data.user;
        
        // Exibe um alerta de sucesso com o seu nome real
        Alert.alert(
          "Login com Sucesso!",
          `Olá, ${user.name}!\nSeu e-mail: ${user.email}`,
          [{ text: "Continuar", onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      } else {
        Alert.alert("Login Cancelado", "O login com o Google foi cancelado.");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert("Entrando...", "O login com Google já está em andamento.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Erro", "O Google Play Services não está disponível.");
            break;
          default:
            Alert.alert("Erro de Login", `Falha ao fazer login: ${error.message || error.code}`);
            break;
        }
      } else {
        Alert.alert("Erro Inesperado", "Ocorreu um erro ao tentar se conectar ao Google.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero section */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1400&auto=format&fit=crop' }}
        style={styles.hero}
        imageStyle={{ opacity: 0.35 }}
      >
        <View style={[styles.heroContent, { paddingTop: insets.top + 24 }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PLATAFORMA OFICIAL</Text>
          </View>
          <Text style={styles.heroTitle}>LicitAcesso</Text>
          <Text style={styles.heroSubtitle}>
            Simplificamos a sua participação em licitações públicas
          </Text>
          <View style={styles.heroDivider} />
        </View>
      </ImageBackground>

      {/* Login section */}
      <View style={[styles.loginSection, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.welcomeTitle}>Bem-vindo</Text>
        <Text style={styles.welcomeSubtitle}>
          Acesse sua conta para gerenciar editais, acompanhar inscrições e impulsionar seu negócio.
        </Text>

        <View style={styles.buttonGroup}>
        <Button
        variant="outline"
        style={styles.googleButtonCustom}
        onPress={handleGoogleSignIn}
        disabled={isSubmitting}
        >
        <Feather name="chrome" size={20} color={colors.text} />
        <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </Button>

          <Button
            variant="secondary"
            style={styles.loginButton}
            onPress={() => router.replace('/(tabs)/dashboard')}
          >
            <View style={[styles.loginIconWrapper, { backgroundColor: colors.green }]}>
              <Feather name="briefcase" size={16} color="#fff" />
            </View>
            <Text style={[styles.loginButtonText, { color: colors.green }]}>Login com CNPJ</Text>
            <Feather name="arrow-right" size={18} color={colors.green} style={{ marginLeft: 'auto' }} />
          </Button>
        </View>

        {/* Support card */}
        <View style={styles.supportCard}>
          <View style={styles.supportIconWrapper}>
            <Feather name="help-circle" size={22} color={colors.orangeDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Precisa de suporte?</Text>
            <Text style={styles.supportText}>Nossa equipe está pronta para ajudar você a começar.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/chat')}
              style={styles.supportLink}
            >
              <Text style={styles.supportLinkText}>Falar com consultor </Text>
              <Feather name="arrow-right" size={12} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: {
    height: 280,
    justifyContent: 'flex-end',
    backgroundColor: colors.primary,
  },
  heroContent: {
    padding: 28,
    gap: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    fontWeight: '500',
    lineHeight: 24,
  },
  heroDivider: {
    width: 48,
    height: 4,
    backgroundColor: '#8df7c1',
    borderRadius: 2,
    marginTop: 8,
  },
  loginSection: {
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
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
googleButtonCustom: {
  width: '100%',
  height: 52,
  borderRadius: 99,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
},
googleButtonText: {
  fontSize: 15,
  fontWeight: '700',
  color: colors.text,
},
  loginIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: { fontSize: 13, fontWeight: '700', color: colors.orangeDark },
  supportText: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: 2 },
  supportLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  supportLinkText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
