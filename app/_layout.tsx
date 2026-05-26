import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin"

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '386479303029-n20jbbhg3kkk2ihjb1jhlbiuld9on5rh.apps.googleusercontent.com',
      offlineAccess: true,
    });
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="error" />
      </Stack>
    </SafeAreaProvider>
  );
}
