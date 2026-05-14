import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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
import { useTheme } from '../src/context/ThemeContext';
import { SIZES, SHADOWS } from '../src/constants/theme';
import ThemeToggle from '../src/components/ThemeToggle';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Ingresa email y contraseña.');
      return;
    }
    setCargando(true);
    const { error } = await iniciarSesion(email.trim().toLowerCase(), password);
    setCargando(false);
    if (error) {
      setErrorMsg(/invalid/i.test(error) ? 'Usuario o contraseña incorrectos' : error);
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        <View pointerEvents="none" style={styles.orbsLayer}>
          <View style={[styles.orb, styles.orbA]} />
          <View style={[styles.orb, styles.orbB]} />
          <View style={[styles.orb, styles.orbC]} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <ThemeToggle light />
            </View>

            <View style={styles.header}>
              <View style={styles.headerBadge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primaryDark} style={{ marginRight: 6 }} />
                <Text style={styles.headerBadgeText}>CPRS</Text>
              </View>
              <Text style={styles.title}>Supervisión</Text>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerDot} />
                <View style={styles.dividerLine} />
              </View>
              <Text style={styles.subtitle}>Plataforma institucional de evaluación</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Iniciar sesión</Text>
              <Text style={styles.cardHint}>Accede con tu cuenta autorizada</Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputWrap, focusEmail && styles.inputWrapFocus]}>
                <View style={[styles.inputIcon, focusEmail && styles.inputIconFocus]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={focusEmail ? '#ffffff' : colors.primary}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="usuario@institucion.gob.mx"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.textLight}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                />
              </View>

              <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
              <View style={[styles.inputWrap, focusPassword && styles.inputWrapFocus]}>
                <View style={[styles.inputIcon, focusPassword && styles.inputIconFocus]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusPassword ? '#ffffff' : colors.primary}
                  />
                </View>
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.textLight}
                  onFocus={() => setFocusPassword(true)}
                  onBlur={() => setFocusPassword(false)}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((s) => !s)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/recuperar-password')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleLogin}
                disabled={cargando}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {cargando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerH}>
                <View style={styles.dividerHLine} />
                <Text style={styles.dividerHText}>o</Text>
                <View style={styles.dividerHLine} />
              </View>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push('/registro')}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryBtnText}>
                  ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.secureRow}>
                <Ionicons name="lock-closed" size={11} color={colors.textLight} />
                <Text style={styles.secureText}>Conexión segura · Cifrado TLS</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerTitle}>Subsecretaría de Control Penitenciario</Text>
              <Text style={styles.footerSubtitle}>Dirección General de Prevención y Reinserción Social</Text>
              <Text style={styles.footerVersion}>v.1.0</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1 },
    bg: { flex: 1 },
    orbsLayer: { ...StyleSheet.absoluteFillObject },
    orb: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
    orbA: { width: 280, height: 280, top: -80, right: -80, backgroundColor: colors.secondary },
    orbB: { width: 220, height: 220, bottom: -60, left: -60, backgroundColor: '#ffffff', opacity: 0.06 },
    orbC: { width: 140, height: 140, top: '38%', right: -40, backgroundColor: colors.secondary, opacity: 0.10 },
    scroll: { flexGrow: 1, padding: SIZES.paddingLarge, paddingTop: 8 },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
    header: { alignItems: 'center', marginBottom: 24 },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
      ...SHADOWS.small,
    },
    headerBadgeText: { color: colors.primaryDark, fontSize: SIZES.xs, fontWeight: '900', letterSpacing: 1.2 },
    title: {
      fontSize: 38,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: -1,
      textShadowColor: 'rgba(0,0,0,0.25)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
    dividerLine: { width: 50, height: 1.5, backgroundColor: colors.secondary, borderRadius: 1 },
    dividerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
    subtitle: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '500', letterSpacing: 0.3 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: SIZES.paddingLarge,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSubtle,
      ...SHADOWS.large,
    },
    cardTitle: { fontSize: SIZES.xl, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
    cardHint: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 4, marginBottom: 18 },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBg,
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 14,
    },
    errorText: { flex: 1, fontSize: SIZES.sm, color: colors.error, fontWeight: '600' },
    label: {
      fontSize: SIZES.xs,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surfaceAlt : '#ffffff',
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      overflow: 'hidden',
    },
    inputWrapFocus: { borderColor: colors.primary, ...SHADOWS.small },
    inputIcon: { width: 46, height: 48, justifyContent: 'center', alignItems: 'center' },
    inputIconFocus: { backgroundColor: colors.primary },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 4,
      fontSize: SIZES.base,
      color: colors.text,
      fontWeight: '500',
    },
    eyeBtn: {
      position: 'absolute',
      right: 8,
      top: 0,
      bottom: 0,
      width: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 12, marginBottom: 8 },
    forgotText: { color: colors.primary, fontSize: SIZES.sm, fontWeight: '700' },
    primaryBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8, ...SHADOWS.medium },
    primaryBtnGradient: {
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: '#ffffff', fontSize: SIZES.base, fontWeight: '800', letterSpacing: 0.5 },
    dividerH: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 12 },
    dividerHLine: { flex: 1, height: 1, backgroundColor: colors.borderSubtle },
    dividerHText: { fontSize: SIZES.xs, color: colors.textLight, fontWeight: '600', letterSpacing: 1 },
    secondaryBtn: { alignItems: 'center', padding: 6 },
    secondaryBtnText: { color: colors.textSecondary, fontSize: SIZES.sm, fontWeight: '500' },
    link: { color: colors.primary, fontWeight: '800' },
    secureRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    secureText: { fontSize: SIZES.xs, color: colors.textLight, fontWeight: '500' },
    footer: { marginTop: 28, alignItems: 'center' },
    footerTitle: { color: 'rgba(255,255,255,0.92)', fontSize: SIZES.sm, fontWeight: '700', textAlign: 'center' },
    footerSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: SIZES.xs, marginTop: 3, textAlign: 'center' },
    footerVersion: { color: 'rgba(255,255,255,0.4)', fontSize: SIZES.xs, marginTop: 2 },
  });
