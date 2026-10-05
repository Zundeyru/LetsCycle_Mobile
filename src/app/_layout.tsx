import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Button } from '@/components/common/Button';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isReady, user, initializationError, retryInitialization } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) return;

    if (segments[0] === '(auth)' && user) {
      router.replace('/(tabs)');
    } else if (segments[0] === '(tabs)' && segments[1] === 'account' && !user) {
      router.replace('/(auth)/login');
    }
  }, [isReady, segments, user]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Menyiapkan LetCycle...</Text>
      </View>
    );
  }

  if (initializationError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>Data akun belum dapat dibuka</Text>
        <Text style={styles.errorText}>{initializationError}</Text>
        <Button onPress={() => void retryInitialization()}>Coba lagi</Button>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.background,
  },
  loadingText: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12 },
  errorTitle: { color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 22, textAlign: 'center' },
  errorText: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12, textAlign: 'center' },
});
