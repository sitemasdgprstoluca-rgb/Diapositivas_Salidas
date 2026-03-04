import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupervision } from '../src/context/SupervisionContext';
import { Button, AreaCard } from '../src/components';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';

export default function AreasScreen() {
  const router = useRouter();
  const { 
    supervisionActual, 
    agregarArea,
    actualizarArea,
    eliminarArea,
    reordenarAreas,
    agregarFoto,
    eliminarFoto,
    guardarSupervision,
    cargando,
  } = useSupervision();

  const [guardando, setGuardando] = useState(false);

  const areas = supervisionActual?.areas || [];

  const handleAgregarArea = () => {
    agregarArea();
  };

  const handleActualizarArea = (id, datos) => {
    actualizarArea(id, datos);
  };

  const handleEliminarArea = (id) => {
    eliminarArea(id);
  };

  const handleMoverArriba = (index) => {
    if (index === 0) return;
    const nuevasAreas = [...areas];
    [nuevasAreas[index - 1], nuevasAreas[index]] = [nuevasAreas[index], nuevasAreas[index - 1]];
    reordenarAreas(nuevasAreas);
  };

  const handleMoverAbajo = (index) => {
    if (index === areas.length - 1) return;
    const nuevasAreas = [...areas];
    [nuevasAreas[index], nuevasAreas[index + 1]] = [nuevasAreas[index + 1], nuevasAreas[index]];
    reordenarAreas(nuevasAreas);
  };

  const handleAgregarFoto = (areaId, foto) => {
    agregarFoto(areaId, foto);
  };

  const handleEliminarFoto = (areaId, fotoIndex) => {
    eliminarFoto(areaId, fotoIndex);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarSupervision('borrador');
      router.push('/vista-previa');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la supervisión.');
    } finally {
      setGuardando(false);
    }
  };

  const handleVolver = async () => {
    await guardarSupervision('borrador');
    router.back();
  };

  const handleIrInicio = async () => {
    await guardarSupervision('borrador');
    router.replace('/');
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
            <Text style={styles.stepBadgeText}>PASO 2 DE 4</Text>
          </View>
          <Text style={styles.headerTitle}>Áreas y Evidencias</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>📍 {areas.length} área{areas.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>📷 {areas.reduce((acc, a) => acc + (a.fotos?.length || 0), 0)} foto{areas.reduce((acc, a) => acc + (a.fotos?.length || 0), 0) !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Contenido */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {areas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin áreas registradas</Text>
            <Text style={styles.emptyText}>
              Agrega las áreas que deseas documentar en la supervisión.
              Para cada área puedes agregar observaciones y fotografías.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAgregarArea}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>+ Agregar primera área</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Reordena las áreas con ▲ ▼. Marca "Sin novedad" si no hay observaciones que reportar.
              </Text>
            </View>

            {areas.map((area, index) => (
              <AreaCard
                key={area.id}
                area={area}
                index={index}
                onUpdate={(datos) => handleActualizarArea(area.id, datos)}
                onRemove={() => handleEliminarArea(area.id)}
                onAddPhoto={(foto) => handleAgregarFoto(area.id, foto)}
                onRemovePhoto={(fotoIndex) => handleEliminarFoto(area.id, fotoIndex)}
                canMoveUp={index > 0}
                canMoveDown={index < areas.length - 1}
                onMoveUp={() => handleMoverArriba(index)}
                onMoveDown={() => handleMoverAbajo(index)}
              />
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleAgregarArea}>
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Agregar otra área</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="← Anterior"
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
              {guardando ? 'Guardando...' : 'Vista previa'}
            </Text>
            <Text style={styles.continueButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  headerStats: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  statBadge: {
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: 120,
  },
  
  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary + '15',
    borderRadius: 14,
    padding: 14,
    marginBottom: SIZES.marginLarge,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  emptyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
  
  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: SIZES.margin,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary + '40',
    ...SHADOWS.small,
  },
  addButtonIcon: {
    fontSize: 22,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '300',
  },
  addButtonText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
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
