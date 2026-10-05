import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

const accountLinks = [
  { label: 'Data diri', icon: 'account-edit-outline' as const },
  { label: 'Riwayat setoran', icon: 'history' as const },
  { label: 'Bantuan dan informasi', icon: 'help-circle-outline' as const },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Tidak dapat keluar dari akun.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>AKUN LETCYCLE</Text>
        <Text style={styles.title}>Profil</Text>

        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.getName().charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user?.getName() ?? 'Pengguna'}</Text>
            <Text style={styles.email}>{user?.getEmail() ?? 'Akun belum tersedia'}</Text>
            <View style={styles.member}>
              <MaterialCommunityIcons name="leaf" size={12} color={Colors.primary} />
              <Text style={styles.memberText}>Anggota LetCycle</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#94A39A" />
        </Card>

        <Text style={styles.sectionTitle}>Pengaturan akun</Text>
        <View style={styles.linkList}>
          {accountLinks.map((link) => (
            <Card key={link.label} padded={false} style={styles.linkCard}>
              <View style={styles.linkIcon}>
                <MaterialCommunityIcons name={link.icon} size={19} color={Colors.primary} />
              </View>
              <Text style={styles.linkText}>{link.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={19} color="#94A39A" />
            </Card>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void handleLogout()}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="logout" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Keluar dari akun</Text>
        </Pressable>
        {logoutError ? <Text accessibilityRole="alert" style={styles.error}>{logoutError}</Text> : null}
        <Text style={styles.version}>LetCycle · Versi pembelajaran</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 125 },
  eyebrow: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 9, letterSpacing: 1.2 },
  title: { marginTop: Spacing.sm, marginBottom: Spacing.xl, color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 29 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 55, height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lime },
  avatarText: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 23 },
  profileCopy: { flex: 1, gap: 4 },
  name: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 13 },
  email: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 9 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  memberText: { color: Colors.primary, fontFamily: FontFamily.medium, fontSize: 8 },
  sectionTitle: { marginTop: Spacing.xxl, marginBottom: Spacing.md, color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 14 },
  linkList: { gap: Spacing.md },
  linkCard: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg },
  linkIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  linkText: { flex: 1, color: Colors.text, fontFamily: FontFamily.medium, fontSize: 10 },
  logout: { minHeight: 54, marginTop: Spacing.xxl, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.sm, backgroundColor: '#F8E9E6' },
  logoutText: { color: Colors.danger, fontFamily: FontFamily.semiBold, fontSize: 11 },
  error: { marginTop: Spacing.sm, color: Colors.danger, fontFamily: FontFamily.body, fontSize: 10 },
  version: { marginTop: Spacing.xl, color: '#99A49D', fontFamily: FontFamily.body, fontSize: 9, textAlign: 'center' },
  pressed: { opacity: 0.75 },
});
