import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from '@/types/AuthError';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (requestError) {
      setError(requestError instanceof AuthError ? requestError.message : 'Tidak dapat masuk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.forest} />
          </Pressable>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="recycle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.brandName}>LetCycle</Text>
          </View>
          <Text style={styles.title}>Senang melihatmu lagi.</Text>
          <Text style={styles.subtitle}>Masuk untuk melanjutkan langkah baikmu.</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <Input
              label="Kata sandi"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={() => void handleLogin()}
            />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Button loading={loading} onPress={() => void handleLogin()} style={styles.submit}>
              Masuk ke akun
            </Button>
          </View>

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>Belum punya akun?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.registerLink}>Daftar sekarang</Text>
              </Pressable>
            </Link>
          </View>
          <Text style={styles.note}>Penyimpanan akun lokal untuk tahap belajar.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  back: { width: 42, height: 42, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.section },
  brandIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  brandName: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 17 },
  title: { marginTop: Spacing.xl, color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 32, lineHeight: 41 },
  subtitle: { marginTop: Spacing.sm, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12 },
  form: { gap: Spacing.lg, marginTop: Spacing.xxl },
  error: { color: Colors.danger, fontFamily: FontFamily.body, fontSize: 12 },
  submit: { marginTop: Spacing.sm },
  registerPrompt: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: Spacing.xl },
  promptText: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 11 },
  registerLink: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 11 },
  note: { marginTop: 'auto', paddingTop: Spacing.section, color: '#91A098', fontFamily: FontFamily.body, fontSize: 9, textAlign: 'center' },
});
