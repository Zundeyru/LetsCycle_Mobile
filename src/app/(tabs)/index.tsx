import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CtaBanner } from '@/components/home/CtaBanner';
import { FeatureList } from '@/components/home/FeatureList';
import { FieldActivityCarousel } from '@/components/home/FieldActivityCarousel';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import { Hero } from '@/components/home/Hero';
import { ImpactStats } from '@/components/home/ImpactStats';
import { WasteCategoryGrid } from '@/components/home/WasteCategoryGrid';
import { WhyItMatters } from '@/components/home/WhyItMatters';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <HomeHeader />
        <Hero />
        <View style={styles.sections}>
          <ImpactStats />
          <FeatureList />
          <WhyItMatters />
          <WasteCategoryGrid />
          <FieldActivityCarousel />
          <CtaBanner />
        </View>
        <HomeFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F2' },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingBottom: 118 },
  sections: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.section, gap: Spacing.section },
});
