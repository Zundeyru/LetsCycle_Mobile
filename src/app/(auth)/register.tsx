import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { AppStrings } from '@/constants/strings';
import { AuthError } from '@/types/AuthError';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, confirmation);
      router.replace('/(tabs)');
    } catch (requestError) {
      setError(requestError instanceof AuthError ? requestError.message : 'Tidak dapat membuat akun. Coba lagi.');
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
          <Text style={styles.title}>Mulai langkah baikmu.</Text>
          <Text style={styles.subtitle}>Buat akun dan tumbuhkan manfaat dari sampah.</Text>

          <View style={styles.form}>
            <Input label="Nama lengkap" value={name} onChangeText={setName} placeholder="Nama kamu" autoCapitalize="words" textContentType="name" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" textContentType="emailAddress" />
            <Input label="Kata sandi" value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" secureTextEntry textContentType="newPassword" />
            <Input label="Konfirmasi kata sandi" value={confirmation} onChangeText={setConfirmation} placeholder="Ketik ulang kata sandi" secureTextEntry textContentType="newPassword" />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Button loading={loading} onPress={() => void handleRegister()} style={styles.submit}>
              Buat akun
            </Button>
          </View>

          <Text style={styles.notice}>{AppStrings.storageNotice}</Text>
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Sudah punya akun?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Masuk</Text>
              </Pressable>
            </Link>
          </View>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.xl },
  brandIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  brandName: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 17 },
  title: { marginTop: Spacing.lg, color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 30, lineHeight: 39 },
  subtitle: { marginTop: Spacing.sm, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12 },
  form: { gap: Spacing.lg, marginTop: Spacing.xl },
  error: { color: Colors.danger, fontFamily: FontFamily.body, fontSize: 12 },
  submit: { marginTop: Spacing.sm },
  notice: { marginTop: Spacing.lg, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 9, lineHeight: 15, textAlign: 'center' },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: Spacing.lg },
  promptText: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 11 },
  loginLink: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 11 },
});
