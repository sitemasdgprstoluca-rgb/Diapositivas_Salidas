import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SupervisionProvider } from '../src/context/SupervisionContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SyncProvider } from '../src/context/SyncProvider';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { supabaseEstaConfigurado } from '../src/config/supabase';

/**
 * Guard de rutas: redirige al login si no hay sesión,
 * o al índice si hay sesión y el usuario está en una ruta de auth.
 * Si Supabase NO está configurado, el guard se desactiva (modo local).
 */
function AuthGuard({ children }) {
  const router = useRouter();
  const segments = useSegments();
  const { autenticado, cargando } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!supabaseEstaConfigurado()) return; // modo local sin auth
    if (cargando) return;

    const enRutaAuth =
      segments[0] === 'login' ||
      segments[0] === 'registro' ||
      segments[0] === 'recuperar-password';

    if (!autenticado && !enRutaAuth) {
      router.replace('/login');
    } else if (autenticado && enRutaAuth) {
      router.replace('/');
    }
  }, [autenticado, cargando, segments]);

  if (supabaseEstaConfigurado() && cargando) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return children;
}

function ThemedStack() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'light'} backgroundColor={colors.primary} />
      <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Volver',
            animation: 'slide_from_right',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false, title: 'Inicio', animation: 'fade' }} />
          <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="registro" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="recuperar-password" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="cambiar-password" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="datos-generales" options={{ headerShown: false, title: 'Datos Generales' }} />
          <Stack.Screen name="areas" options={{ headerShown: false, title: 'Rubros' }} />
          <Stack.Screen name="vista-previa" options={{ headerShown: false, title: 'Vista Previa' }} />
        </Stack>
      </AuthGuard>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SyncProvider>
            <SupervisionProvider>
              <ThemedStack />
            </SupervisionProvider>
          </SyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
