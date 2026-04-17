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
import { Button, RubroCard } from '../src/components';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';
import { calcularPromedioGeneral, colorPorCalificacion } from '../src/constants/data';

export default function AreasScreen() {
  const router = useRouter();
  const {
    supervisionActual,
    actualizarRubro,
    actualizarCriterio,
    agregarFoto,
    eliminarFoto,
    guardarSupervision,
    cargando,
  } = useSupervision();

  const [guardando, setGuardando] = useState(false);

  const rubros = supervisionActual?.areas || [];

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

  // Métricas
  const evaluados = rubros.filter(
    (r) => !r.noAplica && typeof r.calificacion === 'number' && r.calificacion >= 1
  );
  const noAplicaCount = rubros.filter((r) => r.noAplica).length;
  const totalFotos = rubros.reduce((acc, r) => acc + (r.fotos?.length || 0), 0);
  const promedio = calcularPromedioGeneral(rubros);
  const colorPromedio = colorPorCalificacion(Math.round(promedio));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>Indicadores por Rubro</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>
                ✅ {evaluados.length}/{rubros.length - noAplicaCount}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>🚫 {noAplicaCount} N/A</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>📷 {totalFotos}</Text>
            </View>
            <View style={[styles.promedioBadge, { backgroundColor: colorPromedio }]}>
              <Text style={styles.promedioBadgeText}>
                PROM {promedio.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Info */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Evalúa los 15 rubros oficiales. Califica del 1 al 10 (obligatorio responder todos los
            criterios). Si el C.P.R.S. no cuenta con algún rubro, marca "No aplica".
          </Text>
        </View>

        {rubros.map((rubro, index) => (
          <RubroCard
            key={rubro.id}
            rubro={rubro}
            index={index}
            onUpdate={(datos) => actualizarRubro(rubro.id, datos)}
            onUpdateCriterio={actualizarCriterio}
            onAddPhoto={(foto) => agregarFoto(rubro.id, foto)}
            onRemovePhoto={(fotoIndex) => eliminarFoto(rubro.id, fotoIndex)}
          />
        ))}
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
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  promedioBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  promedioBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: 120,
  },

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
