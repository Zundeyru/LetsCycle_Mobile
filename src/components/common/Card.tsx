import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    boxShadow: '0px 5px 14px rgba(23, 51, 41, 0.07)',
    elevation: 3,
  },
  padded: { padding: Spacing.lg },
});
