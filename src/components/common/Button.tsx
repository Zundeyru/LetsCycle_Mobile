import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface ButtonProps extends PropsWithChildren, Omit<PressableProps, 'style' | 'children'> {
  variant?: 'primary' | 'light' | 'orange' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'light' ? Colors.primary : Colors.surface} />
      ) : (
        <Text style={[styles.label, variant === 'light' && styles.lightLabel]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary },
  light: { backgroundColor: Colors.surface },
  orange: { backgroundColor: Colors.orange },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  label: { color: Colors.surface, fontSize: 14, fontFamily: FontFamily.semiBold },
  lightLabel: { color: Colors.primary },
  disabled: { opacity: 0.65 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
