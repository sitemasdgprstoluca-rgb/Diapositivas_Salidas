import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';

export default function RegistroScreen() {
  const router = useRouter();
  const { registrarse } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    if (!email.trim() || !password.trim() || !nombre.trim()) {
      Alert.alert('Datos incompletos', 'Llena todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Mínimo 6 caracteres.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Las contraseñas no coinciden', 'Revisa e inténtalo de nuevo.');
      return;
    }

    setCargando(true);
    const { error } = await registrarse(email.trim().toLowerCase(), password, nombre.trim());
    setCargando(false);

    if (error) {
      Alert.alert('Error al registrar', error);
      return;
    }
    Alert.alert(
      'Cuenta creada',
      'Revisa tu correo para confirmar la cuenta (si tu proyecto lo requiere). Ahora puedes iniciar sesión.',
      [{ text: 'OK', onPress: () => router.replace('/login') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>←  Volver</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Regístrate para sincronizar tus supervisiones</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tucorreo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="Repite tu contraseña"
                secureTextEntry
                placeholderTextColor={COLORS.textLight}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleRegistro}
                disabled={cargando}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.primaryBtnGradient}
                >
                  {cargando ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>Registrarme</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.paddingLarge,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  backText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SIZES.paddingLarge,
    ...SHADOWS.large,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 6,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
    ...SHADOWS.medium,
  },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
