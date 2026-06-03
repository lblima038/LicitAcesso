import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="editais" />
      <Tabs.Screen name="checklist" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="documents" />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
