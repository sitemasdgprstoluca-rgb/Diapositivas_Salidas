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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const { recuperarPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Email requerido', 'Ingresa tu email para enviarte el enlace.');
      return;
    }
    setCargando(true);
    const { error } = await recuperarPassword(email);
    setCargando(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }
    setEnviado(true);
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
              <Text style={styles.title}>Recuperar contraseña</Text>
              <Text style={styles.subtitle}>
                Te enviamos un enlace al correo para que crees una nueva.
              </Text>
            </View>

            <View style={styles.card}>
              {!enviado ? (
                <>
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

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleEnviar}
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
                        <Text style={styles.primaryBtnText}>Enviar enlace</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successBox}>
                  <Ionicons name="mail-outline" size={48} color={COLORS.primary} style={{ marginBottom: 12 }} />
                  <Text style={styles.successTitle}>Revisa tu correo</Text>
                  <Text style={styles.successText}>
                    Si el email <Text style={{ fontWeight: '700' }}>{email}</Text> está
                    registrado, recibirás un enlace para crear una nueva contraseña.
                  </Text>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/login')}>
                    <Text style={styles.secondaryBtnText}>Volver al inicio de sesión</Text>
                  </TouchableOpacity>
                </View>
              )}
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
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.paddingLarge },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 10, marginBottom: 20 },
  backText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.white, letterSpacing: -1 },
  subtitle: { fontSize: SIZES.md, color: COLORS.white, opacity: 0.85, marginTop: 6 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SIZES.paddingLarge,
    ...SHADOWS.large,
  },
  label: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 16,
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', ...SHADOWS.medium },
  primaryBtnGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700', letterSpacing: 0.5 },
  successBox: { alignItems: 'center', paddingVertical: 8 },
  successIcon: { fontSize: 56, marginBottom: 12 },
  successTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  successText: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  secondaryBtnText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: '700' },
});
