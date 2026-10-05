import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, ...props }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.errorField : undefined]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.secondaryText}
          autoCapitalize="none"
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            hitSlop={10}>
            <Text style={styles.toggle}>{isPasswordVisible ? 'Sembunyikan' : 'Lihat'}</Text>
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.sm },
  label: { color: Colors.text, fontFamily: FontFamily.medium, fontSize: 13 },
  field: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  errorField: { borderColor: Colors.danger },
  input: {
    flex: 1,
    color: Colors.text,
    fontFamily: FontFamily.body,
    fontSize: 14,
    paddingVertical: Spacing.md,
  },
  toggle: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 11 },
  error: { color: Colors.danger, fontFamily: FontFamily.body, fontSize: 11 },
});
