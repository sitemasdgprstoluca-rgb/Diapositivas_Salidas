import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

/**
 * Error boundary a nivel de raíz. Si cualquier componente lanza una
 * excepción de render, mostramos un mensaje amigable en lugar de
 * dejar que Expo Go/React Native cierre la app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('[ErrorBoundary] Error capturado:', error?.message);
    console.log('[ErrorBoundary] Stack:', info?.componentStack);
    this.setState({ info });
  }

  reintentar = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.state.error?.message || String(this.state.error || 'Error desconocido');
    const stack = this.state.info?.componentStack || this.state.error?.stack || '';

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.subtitle}>
            La app tuvo un error pero no se cerró. Puedes reintentar o reiniciar la app.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mensaje</Text>
            <Text selectable style={styles.cardText}>{msg}</Text>
          </View>

          {Boolean(stack) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dónde ocurrió</Text>
              <Text selectable style={styles.cardTextSmall}>{stack}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={this.reintentar}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Si el error persiste en Expo Go, en la terminal:{'\n'}
            1. Ctrl+C para detener{'\n'}
            2. npx expo start -c  (limpia caché){'\n'}
            3. Vuelve a escanear el QR
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardTitle: {
    fontSize: SIZES.xs,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardTextSmall: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
  hint: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ErrorBoundary;
