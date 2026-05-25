import { Tabs } from 'expo-router';

// O tab bar customizado é renderizado dentro de cada tela via ScreenLayout.
// Aqui desabilitamos o tab bar padrão do Expo.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="editais" />
      <Tabs.Screen name="checklist" />
      <Tabs.Screen name="chat" />
    </Tabs>
  );
}
