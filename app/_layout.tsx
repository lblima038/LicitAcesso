import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { AppContextProvider } from '../src/context/AppContext';
import { configureGoogleAuth } from '../src/data/authService';

export default function RootLayout() {
  useEffect(() => {
    // Resolve a implementação certa por plataforma (nativa ou web) via Metro.
    configureGoogleAuth();
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
