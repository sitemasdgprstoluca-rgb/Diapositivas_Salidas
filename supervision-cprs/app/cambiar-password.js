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

export default function CambiarPasswordScreen() {
  const router = useRouter();
  const { cambiarPassword } = useAuth();

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    if (pwd !== pwdConfirm) {
      Alert.alert('Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    const { error } = await cambiarPassword(pwd);
    setCargando(false);

    if (error) {
      Alert.alert('No se pudo cambiar la contraseña', error);
      return;
    }
    Alert.alert('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente.', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
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
              <Text style={styles.title}>Cambiar contraseña</Text>
              <Text style={styles.subtitle}>Mínimo 6 caracteres.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={pwd}
                onChangeText={setPwd}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                value={pwdConfirm}
                onChangeText={setPwdConfirm}
                placeholder="Repite tu nueva contraseña"
                secureTextEntry
                placeholderTextColor={COLORS.textLight}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSubmit}
                disabled={cargando}
                activeOpacity={0.9}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.primaryBtnGradient}>
                  {cargando ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>Actualizar contraseña</Text>
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
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.paddingLarge },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 10, marginBottom: 20 },
  backText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.white, letterSpacing: -1 },
  subtitle: { fontSize: SIZES.md, color: COLORS.white, opacity: 0.85, marginTop: 6 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SIZES.paddingLarge, ...SHADOWS.large },
  label: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 6, marginTop: 8 },
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
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 20, ...SHADOWS.medium },
  primaryBtnGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700', letterSpacing: 0.5 },
});
