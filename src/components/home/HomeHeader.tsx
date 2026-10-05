import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { AppStrings } from '@/constants/strings';

export function HomeHeader() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#2f743d', '#3A7D44', '#568f4a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="recycle" size={21} color={Colors.primary} />
        </View>
        <Text style={styles.logoText}>{AppStrings.appName}</Text>
      </View>
      {user ? (
        <View style={styles.account}>
          <View style={styles.greeting}>
            <Text style={styles.hi}>Hi,</Text>
            <Text numberOfLines={1} style={styles.name}>
              {user.getName().split(' ')[0]}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.getName().charAt(0).toUpperCase()}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.authActions}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.login}>Masuk</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(auth)/register')}
            style={styles.register}>
            <Text style={styles.registerText}>Daftar</Text>
          </Pressable>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 76,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontFamily: FontFamily.semiBold, fontSize: 18, letterSpacing: 0.2 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { alignItems: 'flex-end', maxWidth: 100 },
  hi: { color: '#dbead9', fontFamily: FontFamily.body, fontSize: 10 },
  name: { color: '#fff', fontFamily: FontFamily.semiBold, fontSize: 12, maxWidth: 100 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15 },
  authActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  login: { color: '#fff', fontFamily: FontFamily.medium, fontSize: 12 },
  register: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  registerText: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 12 },
});
