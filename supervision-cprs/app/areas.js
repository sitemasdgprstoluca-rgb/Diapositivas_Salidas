import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSupervision } from '../src/context/SupervisionContext';
import { useTheme } from '../src/context/ThemeContext';
import { Button, RubroCard } from '../src/components';
import ThemeToggle from '../src/components/ThemeToggle';
import { SIZES, SHADOWS } from '../src/constants/theme';
import { calcularPromedioGeneral, colorPorCalificacion } from '../src/constants/data';

export default function AreasScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubroId, setSelectedRubroId] = useState(null);

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

  const evaluados = rubros.filter(
    (r) => !r.noAplica && typeof r.calificacion === 'number' && r.calificacion >= 1
  );
  const noAplicaCount = rubros.filter((r) => r.noAplica).length;
  const totalFotos = rubros.reduce((acc, r) => acc + (r.fotos?.length || 0), 0);
  const promedio = calcularPromedioGeneral(rubros);
  const colorPromedio = colorPorCalificacion(Math.round(promedio));

  // Estado por rubro para chip
  const estadoRubro = (r) => {
    if (r.noAplica) return 'na';
    if (typeof r.calificacion === 'number' && r.calificacion >= 1) return 'evaluado';
    return 'pendiente';
  };

  // Filtrado
  const q = searchQuery.trim().toLowerCase();
  const rubrosFiltrados = rubros.filter((r) => {
    if (selectedRubroId && r.id !== selectedRubroId) return false;
    if (!q) return true;
    return (
      r.nombre?.toLowerCase().includes(q) ||
      r.nombreCorto?.toLowerCase().includes(q) ||
      String(r.orden ?? '').includes(q)
    );
  });

  const filtroActivo = !!selectedRubroId || q.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleVolver}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ThemeToggle light />
            <TouchableOpacity style={styles.iconBtn} onPress={handleIrInicio}>
              <Ionicons name="home-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>PASO 2 DE 4</Text>
          </View>
          <Text style={styles.headerTitle}>Indicadores por Rubro</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.statBadgeText}>
                {evaluados.length}/{rubros.length - noAplicaCount}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="ban-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.statBadgeText}>{noAplicaCount} N/A</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="camera-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.statBadgeText}>{totalFotos}</Text>
            </View>
            <View style={[styles.promedioBadge, { backgroundColor: colorPromedio }]}>
              <Text style={styles.promedioBadgeText}>PROM {promedio.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Buscador y chips */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginHorizontal: 10 }} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar rubro por nombre o número..."
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filtroActivo && (
            <TouchableOpacity
              style={[styles.chip, styles.chipReset]}
              onPress={() => {
                setSelectedRubroId(null);
                setSearchQuery('');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.chipResetText}>Mostrar todos ({rubros.length})</Text>
            </TouchableOpacity>
          )}
          {rubros.map((r) => {
            const active = selectedRubroId === r.id;
            const estado = estadoRubro(r);
            const dotColor =
              estado === 'evaluado' ? colors.success
              : estado === 'na' ? colors.textLight
              : colors.warning;
            const label = r.nombreCorto || r.nombre || `Rubro ${r.orden}`;
            const labelTrunc = label.length > 22 ? label.slice(0, 22) + '…' : label;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedRubroId(active ? null : r.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                  {String(r.orden ?? '').padStart(2, '0')}. {labelTrunc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!filtroActivo && (
          <View style={styles.infoBox}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={styles.infoText}>
              Evalúa los 15 rubros oficiales. Califica del 1 al 10. Si el C.P.R.S. no cuenta con
              algún rubro, marca "No aplica". Usa el buscador o las pestañas para saltar a un rubro.
            </Text>
          </View>
        )}

        {filtroActivo && (
          <View style={styles.filterStatus}>
            <Ionicons name="filter" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.filterStatusText}>
              Mostrando {rubrosFiltrados.length} de {rubros.length} rubros
            </Text>
          </View>
        )}

        {rubrosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Sin coincidencias</Text>
            <Text style={styles.emptySubtitle}>
              No se encontró ningún rubro que coincida con tu búsqueda.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setSelectedRubroId(null);
                setSearchQuery('');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyResetBtnText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rubrosFiltrados.map((rubro) => {
            const realIndex = rubros.findIndex((x) => x.id === rubro.id);
            return (
              <RubroCard
                key={rubro.id}
                rubro={rubro}
                index={realIndex}
                onUpdate={(datos) => actualizarRubro(rubro.id, datos)}
                onUpdateCriterio={actualizarCriterio}
                onAddPhoto={(foto) => agregarFoto(rubro.id, foto)}
                onRemovePhoto={(fotoIndex) => eliminarFoto(rubro.id, fotoIndex)}
              />
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="← Anterior" onPress={handleVolver} variant="outline" style={styles.footerButton} />
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueButtonText}>{guardando ? 'Guardando...' : 'Vista previa'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    loadingText: { fontSize: SIZES.lg, color: colors.textSecondary },

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
    iconBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      justifyContent: 'center', alignItems: 'center',
    },
    stepBadge: {
      backgroundColor: colors.secondary,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 10,
    },
    stepBadgeText: {
      color: colors.primaryDark,
      fontSize: SIZES.xs,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    headerTitle: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
    headerStats: { flexDirection: 'row', marginTop: 10, gap: 8, flexWrap: 'wrap' },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
    },
    statBadgeText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
    promedioBadge: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
      borderWidth: 1.5, borderColor: '#fff',
    },
    promedioBadgeText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800', letterSpacing: 0.5 },

    // Filter bar
    filterBar: {
      backgroundColor: colors.surface,
      paddingTop: 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      ...SHADOWS.small,
    },
    searchWrap: {
      marginHorizontal: SIZES.padding,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surfaceAlt : '#F5F1EC',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      paddingRight: 8,
      fontSize: SIZES.sm,
      color: colors.text,
    },
    clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
    chipsRow: {
      paddingHorizontal: SIZES.padding,
      paddingTop: 10,
      gap: 8,
      flexDirection: 'row',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      backgroundColor: isDark ? colors.surfaceAlt : '#FAF8F5',
      maxWidth: 220,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    chipText: { fontSize: SIZES.xs, color: colors.text, fontWeight: '700' },
    chipTextActive: { color: '#fff' },
    chipReset: {
      backgroundColor: colors.primaryDark,
      borderColor: colors.primaryDark,
    },
    chipResetText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800' },

    // Content
    content: { flex: 1 },
    contentContainer: { padding: SIZES.padding, paddingBottom: 120 },

    infoBox: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(212,169,76,0.10)' : '#D4A94C25',
      borderRadius: 14,
      padding: 14,
      marginBottom: SIZES.marginLarge,
      alignItems: 'flex-start',
      borderLeftWidth: 4,
      borderLeftColor: colors.secondary,
    },
    infoText: { flex: 1, fontSize: SIZES.sm, color: colors.text, lineHeight: 20 },

    filterStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    filterStatusText: { fontSize: SIZES.xs, color: colors.textSecondary, fontWeight: '700' },

    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: SIZES.padding,
    },
    emptyTitle: {
      fontSize: SIZES.lg,
      fontWeight: '800',
      color: colors.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: SIZES.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
      maxWidth: 260,
    },
    emptyResetBtn: {
      marginTop: 18,
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
    },
    emptyResetBtnText: { color: '#fff', fontWeight: '800', fontSize: SIZES.sm },

    footer: {
      flexDirection: 'row',
      padding: SIZES.padding,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      gap: 12,
      ...SHADOWS.small,
    },
    footerButton: { flex: 1 },
    continueButton: { flex: 2, borderRadius: 14, overflow: 'hidden', ...SHADOWS.medium },
    continueGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 8,
    },
    continueButtonText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  });
