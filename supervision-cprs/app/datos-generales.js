import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSupervision } from '../src/context/SupervisionContext';
import { Button, DateTimeInput, Select } from '../src/components';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';
import { validarDatosGenerales } from '../src/utils/validation';
import { LISTA_CPRS } from '../src/constants/data';

export default function DatosGeneralesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { 
    supervisionActual, 
    cargarSupervision, 
    actualizarDatosGenerales,
    guardarSupervision,
    nuevaSupervision,
    cargando,
  } = useSupervision();

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarSupervision(id);
    } else if (!supervisionActual) {
      nuevaSupervision();
    }
  }, [id]);

  // Precargar fecha de hoy cuando se crea una nueva supervisión
  useEffect(() => {
    if (supervisionActual && !supervisionActual.datosGenerales?.fechaHoraSupervision) {
      const ahora = new Date();
      actualizarDatosGenerales({ fechaHoraSupervision: ahora.toISOString() });
    }
  }, [supervisionActual?.id]);

  const datosGenerales = supervisionActual?.datosGenerales || {
    fechaHoraSupervision: new Date().toISOString(),
    nombreCprs: '',
    imagenCentro: null,
    generoDirector: 'mujer',
    generoAdministrador: 'hombre',
  };

  const handleChange = (campo, valor) => {
    actualizarDatosGenerales({ [campo]: valor });
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }));
    }
  };

  const seleccionarImagenCentro = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar la imagen.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        handleChange('imagenCentro', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const tomarFotoCentro = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar la foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        handleChange('imagenCentro', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto.');
    }
  };

  const mostrarOpcionesImagen = () => {
    Alert.alert(
      'Imagen del Centro',
      'Selecciona una opción para agregar la imagen de la entrada principal del centro',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Tomar foto', onPress: tomarFotoCentro },
        { text: '🖼️ Galería', onPress: seleccionarImagenCentro },
      ]
    );
  };

  const handleGuardar = async () => {
    const validacion = validarDatosGenerales(datosGenerales);
    
    if (!validacion.isValid) {
      setErrores(validacion.errores);
      Alert.alert(
        'Campos incompletos',
        'Por favor, completa todos los campos requeridos.',
        [{ text: 'OK' }]
      );
      return;
    }

    setGuardando(true);
    try {
      await guardarSupervision('borrador');
      router.push('/areas');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la supervisión.');
    } finally {
      setGuardando(false);
    }
  };

  const handleVolver = () => {
    Alert.alert(
      'Salir sin guardar',
      '¿Deseas guardar los cambios antes de salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'No guardar', 
          style: 'destructive',
          onPress: () => router.back() 
        },
        { 
          text: 'Guardar', 
          onPress: async () => {
            await guardarSupervision('borrador');
            router.back();
          }
        },
      ]
    );
  };

  if (cargando || !supervisionActual) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header con gradiente */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>PASO 1 DE 4</Text>
            </View>
            <Text style={styles.headerTitle}>Datos Generales</Text>
            <Text style={styles.headerSubtitle}>Información básica de la supervisión</Text>
          </View>
        </LinearGradient>

        {/* Formulario */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📋</Text>
              <View>
                <Text style={styles.cardTitle}>Información del C.P.R.S.</Text>
                <Text style={styles.cardSubtitle}>Completa todos los campos</Text>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Select
                label="Nombre del C.P.R.S."
                value={datosGenerales.nombreCprs}
                options={LISTA_CPRS}
                onSelect={(value) => handleChange('nombreCprs', value)}
                placeholder="Seleccionar C.P.R.S..."
                error={errores.nombreCprs}
                required
              />

              <DateTimeInput
                label="Fecha y hora de supervisión"
                value={datosGenerales.fechaHoraSupervision ? new Date(datosGenerales.fechaHoraSupervision) : new Date()}
                onChange={(date) => handleChange('fechaHoraSupervision', date.toISOString())}
                mode="datetime"
                error={errores.fechaHoraSupervision}
                required
                placeholder="Seleccionar fecha y hora..."
              />

              <Select
                label="Director(a) del C.P.R.S."
                value={datosGenerales.generoDirector || 'mujer'}
                options={[
                  { label: 'Directora (Mujer)', value: 'mujer' },
                  { label: 'Director (Hombre)', value: 'hombre' },
                ]}
                onSelect={(value) => handleChange('generoDirector', value)}
                placeholder="Seleccionar..."
              />

              <Select
                label="Administrador(a) del C.P.R.S."
                value={datosGenerales.generoAdministrador || 'hombre'}
                options={[
                  { label: 'Administradora (Mujer)', value: 'mujer' },
                  { label: 'Administrador (Hombre)', value: 'hombre' },
                ]}
                onSelect={(value) => handleChange('generoAdministrador', value)}
                placeholder="Seleccionar..."
              />
            </View>
          </View>

          {/* Sección de imagen del centro */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📸</Text>
              <View>
                <Text style={styles.cardTitle}>Imagen del Centro</Text>
                <Text style={styles.cardSubtitle}>Entrada principal del C.P.R.S.</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.imageSelector}
              onPress={mostrarOpcionesImagen}
              activeOpacity={0.7}
            >
              {datosGenerales.imagenCentro ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: datosGenerales.imagenCentro }} 
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>Tocar para cambiar</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>🏛️</Text>
                  <Text style={styles.imagePlaceholderText}>Agregar imagen de la entrada</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Toca para seleccionar o tomar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              La fecha y hora se precargan automáticamente. Puedes modificarlas si la supervisión fue en otro momento.
            </Text>
          </View>
        </ScrollView>

        {/* Footer con botones */}
        <View style={styles.footer}>
          <Button
            title="Cancelar"
            onPress={handleVolver}
            variant="outline"
            style={styles.footerButton}
          />
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleGuardar}
            disabled={guardando}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueButtonText}>
                {guardando ? 'Guardando...' : 'Continuar'}
              </Text>
              <Text style={styles.continueButtonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
  },
  
  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '300',
  },
  headerContent: {},
  stepBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepBadgeText: {
    color: COLORS.primaryDark,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 4,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  
  // Form Card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputSection: {
    gap: 8,
  },
  
  // Image selector
  imageSelector: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
  },
  imageOverlayText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  imagePlaceholderIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  imagePlaceholderSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary + '15',
    borderRadius: 14,
    padding: 16,
    marginBottom: SIZES.marginLarge,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    ...SHADOWS.small,
  },
  footerButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
    marginRight: 8,
  },
  continueButtonIcon: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '300',
  },
});
