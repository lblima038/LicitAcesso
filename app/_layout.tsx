import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AppContextProvider } from '../src/context/AppContext';

const GOOGLE_WEB_CLIENT_ID = '386479303029-n20jbbhg3kkk2ihjb1jhlbiuld9on5rh.apps.googleusercontent.com';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    } catch {}
  }, []);

  return (
    <AppContextProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="error" />
        </Stack>
      </SafeAreaProvider>
    </AppContextProvider>
  );
}
