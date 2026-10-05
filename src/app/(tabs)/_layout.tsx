import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: '#F5F7F2' },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="location" />
        <Tabs.Screen name="marketplace" />
        <Tabs.Screen name="account" />
      </Tabs>
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
