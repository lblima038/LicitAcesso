/**
 * presentation/components/Button.tsx
 * Botão com 4 variantes (primary, secondary, outline, ghost).
 */
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const buttonVariants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.accent },
    text: { color: '#fff' },
  },
  secondary: {
    container: { backgroundColor: colors.greenLight },
    text: { color: colors.green },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#737685' },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.accent },
  },
};

export function Button({ children, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.buttonBase, v.container, style, disabled && { opacity: 0.5 }]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.buttonText, v.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
