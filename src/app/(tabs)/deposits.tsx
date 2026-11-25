import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { wasteCategoryVisuals } from '@/components/deposits/wasteCategoryVisuals';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useDeposits } from '@/hooks/useDeposits';
import type { DepositDto } from '@/shared/types/deposits';
import { findWasteCategory, formatRupiah, WasteCategories, type WasteCategoryId } from '@/shared/wasteCategories';

export default function DepositsScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* key = user.id: state setoran selalu baru per akun (tidak tercampur setelah ganti akun). */}
      {user ? <DepositsContent key={user.id} /> : <LoginPrompt />}
    </SafeAreaView>
  );
}

function LoginPrompt() {
  return (
    <View style={[styles.container, styles.centered]}>
      <View style={styles.promptIcon}>
        <MaterialCommunityIcons name="scale-balance" size={32} color={Colors.primary} />
      </View>
      <Text accessibilityRole="header" style={styles.promptTitle}>Catat setoran sampahmu</Text>
      <Text style={styles.stateMessage}>Masuk untuk mencatat setoran dan melihat estimasi uang yang kamu kumpulkan.</Text>
      <Button onPress={() => router.push('/(auth)/login')} style={styles.promptButton}>
        Masuk
      </Button>
    </View>
  );
}

function parseWeight(text: string): number {
  // Terima koma desimal ala Indonesia (2,5) maupun titik (2.5).
  return Number(text.replace(',', '.'));
}

function DepositsContent() {
  const { deposits, status, error, refreshing, adding, updatingIds, refresh, retry, addDeposit, toggleCompleted } =
    useDeposits();
  const [categoryId, setCategoryId] = useState<WasteCategoryId>('plastic');
  const [weightText, setWeightText] = useState('');

  const selectedCategory = findWasteCategory(categoryId);
  const weight = parseWeight(weightText);
  const preview =
    selectedCategory?.pricePerKg && Number.isFinite(weight) && weight > 0
      ? formatRupiah(Math.round(weight * selectedCategory.pricePerKg))
      : null;

  const completed = deposits.filter((deposit) => deposit.status === 'completed');
  const earned = completed.reduce((sum, deposit) => sum + (deposit.estimatedValue ?? 0), 0);
  const totalKg = completed.reduce((sum, deposit) => sum + deposit.weightKg, 0);

  const handleAdd = async () => {
    if (await addDeposit({ categoryId, weightKg: weight })) setWeightText('');
  };

  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>SETOR SAMPAH, DAPAT UANG</Text>
          <Text accessibilityRole="header" style={styles.title}>Setoran sampah</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Muat ulang daftar setoran"
          accessibilityHint="Mengambil data setoran terbaru dari server"
          disabled={status === 'loading' || refreshing}
          onPress={() => void refresh()}
          style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}>
          {refreshing ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <MaterialCommunityIcons name="refresh" size={22} color={Colors.primary} />
          )}
        </Pressable>
      </View>

      <View style={styles.summary} accessible accessibilityLabel={`Sudah disetor ${totalKg} kilogram, estimasi ${formatRupiah(earned)}`}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Estimasi uang</Text>
          <Text style={styles.summaryValue}>{formatRupiah(earned)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Sudah disetor</Text>
          <Text style={styles.summaryValue}>{totalKg.toLocaleString('id-ID')} kg</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Catat setoran baru</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {WasteCategories.map((category) => {
            const selected = category.id === categoryId;
            const visual = wasteCategoryVisuals[category.id];
            return (
              <Pressable
                key={category.id}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityLabel={category.name}
                onPress={() => setCategoryId(category.id)}
                style={[styles.chip, selected && styles.chipSelected]}>
                <MaterialCommunityIcons name={visual.icon} size={18} color={selected ? Colors.surface : visual.color} />
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{category.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.weightRow}>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            placeholder="Berat, mis. 2,5"
            placeholderTextColor={Colors.secondaryText}
            accessibilityLabel="Berat sampah dalam kilogram"
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={() => void handleAdd()}
            editable={!adding}
            maxLength={6}
            style={styles.input}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
        <Text style={styles.preview}>
          {selectedCategory?.pricePerKg === null
            ? 'Elektronik dinilai sesuai kondisi di titik setor.'
            : preview
              ? `Estimasi: ${preview}`
              : `Harga ${formatRupiah(selectedCategory?.pricePerKg ?? 0)} / kg`}
        </Text>
        <Button loading={adding} disabled={!weightText.trim()} onPress={() => void handleAdd()}>
          Catat setoran
        </Button>
      </View>

      <Text style={styles.sectionTitle}>Riwayat setoran</Text>
    </View>
  );

  if (status === 'loading' || status === 'error') {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.stateBox}>
          {status === 'loading' ? (
            <>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.stateTitle}>Memuat riwayat setoran...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="alert-circle-outline" size={34} color={Colors.danger} />
              <Text style={styles.stateTitle}>Gagal memuat setoran</Text>
              <Text accessibilityRole="alert" style={styles.stateMessage}>{error}</Text>
              <Button onPress={() => void retry()} style={styles.retryButton}>
                Coba Lagi
              </Button>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={deposits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DepositRow deposit={item} updating={updatingIds.has(item.id)} onToggle={() => void toggleCompleted(item)} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="recycle" size={34} color={Colors.primary} />
          <Text style={styles.stateTitle}>Belum ada setoran</Text>
          <Text style={styles.stateMessage}>Catat setoran pertamamu lewat form di atas.</Text>
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={Colors.primary} />}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, styles.list]}
      showsVerticalScrollIndicator={false}
    />
  );
}

interface DepositRowProps {
  deposit: DepositDto;
  updating: boolean;
  onToggle(): void;
}

function DepositRow({ deposit, updating, onToggle }: DepositRowProps) {
  const category = findWasteCategory(deposit.categoryId);
  const visual = wasteCategoryVisuals[deposit.categoryId];
  const done = deposit.status === 'completed';
  const date = new Date(deposit.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const value = deposit.estimatedValue === null ? 'Sesuai kondisi' : formatRupiah(deposit.estimatedValue);

  return (
    <Pressable
      accessibilityRole="checkbox"
      aria-checked={done}
      aria-busy={updating}
      accessibilityLabel={`${category?.name ?? 'Sampah'} ${deposit.weightKg.toLocaleString('id-ID')} kilogram, ${value}, ${done ? 'selesai disetor' : 'dijadwalkan'}`}
      accessibilityHint={done ? 'Tandai sebagai dijadwalkan' : 'Tandai sudah disetor'}
      disabled={updating}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, done && styles.rowDone, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: visual.tint }]}>
        <MaterialCommunityIcons name={visual.icon} size={22} color={visual.color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{category?.name}</Text>
        <Text style={styles.rowMeta}>
          {deposit.weightKg.toLocaleString('id-ID')} kg · {date}
        </Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {updating ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <View style={[styles.statusPill, done && styles.statusPillDone]}>
          <MaterialCommunityIcons
            name={done ? 'check-circle' : 'clock-outline'}
            size={14}
            color={done ? Colors.surface : Colors.forest}
          />
          <Text style={[styles.statusText, done && styles.statusTextDone]}>{done ? 'Selesai' : 'Dijadwalkan'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingBottom: 125 },
  list: { gap: Spacing.sm, paddingBottom: 125 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  headerCopy: { flex: 1 },
  eyebrow: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 12, letterSpacing: 1.2 },
  title: { marginTop: Spacing.sm, color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 29 },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.forest,
  },
  summaryItem: { flex: 1, gap: 2 },
  summaryDivider: { width: 1, alignSelf: 'stretch', marginHorizontal: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.25)' },
  summaryLabel: { color: '#D7E6DC', fontFamily: FontFamily.medium, fontSize: 12 },
  summaryValue: { color: Colors.surface, fontFamily: FontFamily.semiBold, fontSize: 18 },
  form: { gap: Spacing.md, marginTop: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.surface },
  formTitle: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  chipText: { color: Colors.text, fontFamily: FontFamily.medium, fontSize: 13 },
  chipTextSelected: { color: Colors.surface },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: FontFamily.body,
    fontSize: 14,
  },
  unit: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 14 },
  preview: { color: Colors.primary, fontFamily: FontFamily.medium, fontSize: 13 },
  sectionTitle: { marginTop: Spacing.xl, marginBottom: Spacing.sm, color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15 },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowDone: { borderLeftColor: Colors.primary },
  rowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontFamily: FontFamily.semiBold, fontSize: 14 },
  rowMeta: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12 },
  rowValue: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 13 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
  },
  statusPillDone: { backgroundColor: Colors.primary },
  statusText: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 12 },
  statusTextDone: { color: Colors.surface },
  stateBox: {
    minHeight: 200,
    marginTop: Spacing.sm,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  stateTitle: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15, textAlign: 'center' },
  stateMessage: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { minWidth: 160 },
  promptIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  promptTitle: { color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 24, textAlign: 'center' },
  promptButton: { minWidth: 200, marginTop: Spacing.sm },
  pressed: { opacity: 0.75 },
});
