import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import { useSupervision } from '../src/context/SupervisionContext';
import { LoadingModal } from '../src/components';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';
import { 
  formatearFechaCompleta, 
  formatearFechaDiaMes, 
  formatearHora,
  generarNombreArchivo,
  formatearFechaDisplay,
} from '../src/utils/dateUtils';
import { validarSupervisionCompleta } from '../src/utils/validation';
import { generarPPTX, compartirPPTX } from '../src/utils/pptxGenerator';
import { generarPDF, compartirPDF } from '../src/utils/pdfGenerator';

export default function VistaPreviaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { 
    supervisionActual, 
    cargarSupervision,
    guardarSupervision,
    cargando,
  } = useSupervision();

  const [generando, setGenerando] = useState(false);
  const [tipoGenerando, setTipoGenerando] = useState(null); // 'pptx' o 'pdf'

  useEffect(() => {
    if (id && (!supervisionActual || supervisionActual.id !== id)) {
      cargarSupervision(id);
    }
  }, [id]);

  const datosGenerales = supervisionActual?.datosGenerales || {};
  const areas = supervisionActual?.areas || [];

  const handleVolver = () => {
    router.push('/areas');
  };

  const handleVolverDatos = () => {
    router.push('/datos-generales');
  };

  const handleIrInicio = async () => {
    await guardarSupervision('borrador');
    router.replace('/');
  };

  const validarAntes = () => {
    const validacion = validarSupervisionCompleta(supervisionActual);
    
    if (!validacion.puedeGenerar) {
      Alert.alert(
        'No se puede generar',
        `Por favor corrige los siguientes errores:\n\n${validacion.errores.join('\n')}`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleGenerarPPTX = async () => {
    if (!validarAntes()) return;
    await ejecutarGeneracionYCompartir('pptx');
  };

  const handleGenerarPDF = async () => {
    if (!validarAntes()) return;
    await ejecutarGeneracionYCompartir('pdf');
  };

  const ejecutarGeneracionYCompartir = async (tipo) => {
    setGenerando(true);
    setTipoGenerando(tipo);
    
    let filePath = null;
    
    try {
      console.log(`[${tipo.toUpperCase()}] Iniciando generación...`);
      if (tipo === 'pptx') {
        filePath = await generarPPTX(supervisionActual);
      } else {
        filePath = await generarPDF(supervisionActual);
      }
      console.log(`[${tipo.toUpperCase()}] Archivo generado:`, filePath);
      
      // Marcar como finalizado
      await guardarSupervision('finalizado');
      
    } catch (error) {
      console.error(`Error generando ${tipo}:`, error);
      setGenerando(false);
      setTipoGenerando(null);
      Alert.alert(
        'Error',
        `No se pudo generar el archivo ${tipo.toUpperCase()}. Por favor, intenta de nuevo.\n\n${error.message || ''}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Cerrar modal ANTES de compartir para que no bloquee
    setGenerando(false);
    setTipoGenerando(null);
    
    // Compartir después de cerrar el modal
    if (filePath && Platform.OS !== 'web') {
      // Pequeño delay para que el modal termine de cerrarse
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Verificar que el archivo existe
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
          Alert.alert('Error', 'El archivo no se encontró después de generarse.');
          return;
        }
        
        console.log(`[${tipo.toUpperCase()}] Archivo existe, tamaño: ${fileInfo.size} bytes`);
        
        // Mostrar Alert con opciones
        Alert.alert(
          'Archivo Generado',
          `Se generó correctamente:\n${filePath.split('/').pop()}\n\nTamaño: ${Math.round(fileInfo.size / 1024)} KB`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Compartir',
              onPress: async () => {
                try {
                  console.log(`[${tipo.toUpperCase()}] Abriendo diálogo de compartir...`);
                  if (tipo === 'pptx') {
                    await compartirPPTX(filePath);
                  } else {
                    await compartirPDF(filePath);
                  }
                  console.log(`[${tipo.toUpperCase()}] Proceso completado`);
                } catch (shareErr) {
                  console.log(`[${tipo.toUpperCase()}] Error al compartir:`, shareErr.message);
                  Alert.alert('Error', `No se pudo compartir: ${shareErr.message}`);
                }
              },
            },
          ]
        );
      } catch (shareError) {
        console.log(`[${tipo.toUpperCase()}] Error:`, shareError.message);
        Alert.alert('Error', `Ocurrió un error: ${shareError.message}`);
      }
    } else if (Platform.OS === 'web') {
      Alert.alert('Éxito', 'El archivo se ha descargado automáticamente.');
    }
  };

  if (cargando || !supervisionActual) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  const nombreArchivo = generarNombreArchivo(
    datosGenerales.nombreCprs || 'CPRS',
    datosGenerales.fechaHoraSupervision
  );

  const totalFotos = areas.reduce((acc, a) => acc + (a.fotos?.length || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal de carga durante generación */}
      <LoadingModal visible={generando} tipo={tipoGenerando} />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleIrInicio}>
            <Text style={styles.homeButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>PASO 3 DE 4</Text>
          </View>
          <Text style={styles.headerTitle}>Vista Previa</Text>
          <Text style={styles.headerSubtitle}>Revisa y genera tu presentación</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryIcon}>📊</Text>
            <View style={styles.summaryTitleSection}>
              <Text style={styles.summaryTitle}>{datosGenerales.nombreCprs || 'Sin nombre'}</Text>
              <Text style={styles.summarySubtitle}>
                {formatearFechaDisplay(datosGenerales.fechaHoraSupervision)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{areas.length}</Text>
              <Text style={styles.statLabel}>Área{areas.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalFotos}</Text>
              <Text style={styles.statLabel}>Foto{totalFotos !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{areas.filter(a => a.sinNovedad).length}</Text>
              <Text style={styles.statLabel}>Sin novedad</Text>
            </View>
          </View>
        </View>

        {/* Resumen de áreas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Áreas supervisadas</Text>
          
          {areas.length === 0 ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                No se han registrado áreas. El documento se generará vacío.
              </Text>
            </View>
          ) : (
            areas.map((area, index) => (
              <View key={area.id} style={styles.areaCard}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaNumberBadge}>
                    <Text style={styles.areaNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.areaName}>{area.nombre || 'Sin nombre'}</Text>
                  {area.sinNovedad && (
                    <View style={styles.sinNovedadBadge}>
                      <Text style={styles.sinNovedadText}>✓</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.areaObservacion} numberOfLines={2}>
                  {area.sinNovedad ? 'Sin novedad' : area.observacion || 'Sin observación'}
                </Text>
                
                {area.fotos && area.fotos.length > 0 && (
                  <View style={styles.photosPreview}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {area.fotos.slice(0, 4).map((foto, fotoIndex) => (
                        <Image 
                          key={fotoIndex} 
                          source={{ uri: foto.uri }} 
                          style={styles.photoThumb}
                        />
                      ))}
                      {area.fotos.length > 4 && (
                        <View style={styles.morePhotos}>
                          <Text style={styles.morePhotosText}>+{area.fotos.length - 4}</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Info del archivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Archivo a generar</Text>
          <View style={styles.fileCard}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>📊</Text>
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{nombreArchivo}</Text>
              <Text style={styles.fileType}>PowerPoint (.pptx)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer con opciones */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButtonOutline}
          onPress={handleVolver}
        >
          <Text style={styles.footerButtonOutlineText}>← Áreas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.pdfButtonContainer}
          onPress={handleGenerarPDF}
          disabled={generando}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={generando && tipoGenerando === 'pdf' ? [COLORS.textSecondary, COLORS.textSecondary] : ['#C62828', '#8A1C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButtonGradient}
          >
            {generando && tipoGenerando === 'pdf' ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.generateButtonText}>📄 PDF</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.generateButtonContainer}
          onPress={handleGenerarPPTX}
          disabled={generando}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={generando && tipoGenerando === 'pptx' ? [COLORS.textSecondary, COLORS.textSecondary] : [COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButtonGradient}
          >
            {generando && tipoGenerando === 'pptx' ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.generateButtonText}>📊 PPTX</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Componente auxiliar para filas de datos
const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginTop: 12,
  },
  
  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '300',
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 20,
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
    paddingBottom: 120,
  },
  successBanner: {
    backgroundColor: COLORS.success + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  successBannerText: {
    color: COLORS.success,
    fontWeight: '700',
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  summaryTitleSection: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  summarySubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: 10,
  },
  
  // Section
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  
  // Warning card
  warningCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Area Card
  areaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  areaNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaNumber: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  areaName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  sinNovedadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinNovedadText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '700',
  },
  areaObservacion: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  photosPreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  photoThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: COLORS.border,
  },
  morePhotos: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // File Card
  fileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  fileType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  // Success Card
  successCard: {
    backgroundColor: COLORS.success + '15',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.success,
  },
  successText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginTop: 2,
  },
  shareButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonSmallText: {
    fontSize: 18,
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
  generateButtonContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  successButtonContainer: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  successButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  successButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
  footerButtonOutline: {
    flex: 0.8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  footerButtonOutlineText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  pdfButtonContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  // Estilos para footer con archivo generado
  footerGeneratedContainer: {
    flex: 1,
    gap: 10,
  },
  footerTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButtonSmall: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  footerButtonSmallText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  viewButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  shareButton: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  homeButtonFull: {
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  homeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
});
