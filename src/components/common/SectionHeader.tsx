import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm, marginBottom: Spacing.xl },
  title: { color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 23, lineHeight: 30 },
  description: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 19 },
});
