import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppContext } from '../src/context/AppContext';
import { colors } from '../src/presentation/components';

export default function Index() {
  const { firebaseUser, authLoading } = useAppContext();

  useEffect(() => {
    if (authLoading) return;
    if (firebaseUser) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [authLoading, firebaseUser]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
