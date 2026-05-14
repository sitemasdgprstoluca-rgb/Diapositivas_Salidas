import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Botón redondo guinda translúcido para alternar light/dark.
 * Pensado para vivir en headers con fondo guinda.
 */
export default function ThemeToggle({ light = true, style }) {
  const { isDark, toggle } = useTheme();
  const tint = light ? '#ffffff' : '#0f0d11';
  const bg = light ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg }, style]}
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={tint} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
