import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { colorPorCalificacion, calcularMaxCalificacion } from '../constants/data';
import TextInput from './TextInput';
import PhotoPicker from './PhotoPicker';

const CALIFICACIONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const RubroCard = ({
  rubro,
  index,
  onUpdate,
  onUpdateCriterio,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const { colors, isDark } = useTheme();
  const COLORS = colors;
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleNoAplica = (value) => {
    onUpdate({
      noAplica: value,
      calificacion: value ? null : rubro.calificacion,
      sinNovedad: value ? false : rubro.sinNovedad,
      observacion: value ? '' : rubro.observacion,
    });
  };

  const topeInfo = useMemo(
    () => calcularMaxCalificacion(rubro.criterios),
    [rubro.criterios]
  );

  const handleCalificacion = (valor) => {
    // Validación: no se puede dar más calificación que el tope derivado de criterios.
    if (topeInfo.totalCriterios > 0 && !topeInfo.completos) {
      Alert.alert(
        'Faltan criterios por evaluar',
        `Marca SÍ o NO en los ${topeInfo.totalCriterios} criterios antes de calificar. Llevas ${topeInfo.respondidos} de ${topeInfo.totalCriterios}.`,
        [{ text: 'Entendido' }]
      );
      return;
    }
    if (valor > topeInfo.tope) {
      Alert.alert(
        'Calificación no permitida',
        `Con ${topeInfo.cumplidos} de ${topeInfo.totalCriterios} criterios cumplidos, la calificación máxima posible es ${topeInfo.tope}. Cumple más criterios SÍ para subir el tope.`,
        [{ text: 'Entendido' }]
      );
      return;
    }
    onUpdate({ calificacion: valor });
  };

  const handleSinNovedad = (value) => {
    onUpdate({
      sinNovedad: value,
      observacion: value ? 'Sin novedad.' : '',
    });
  };

  const handleCriterio = (criterioId, cumple) => {
    onUpdateCriterio(rubro.id, criterioId, cumple);
    // Si la calificación actual queda por encima del nuevo tope, la limpiamos.
    const proximosCriterios = (rubro.criterios || []).map((c) =>
      c.id === criterioId ? { ...c, cumple } : c
    );
    const proximoTope = calcularMaxCalificacion(proximosCriterios);
    if (
      proximoTope.completos &&
      typeof rubro.calificacion === 'number' &&
      rubro.calificacion > proximoTope.tope
    ) {
      onUpdate({ calificacion: proximoTope.tope });
    }
  };

  const colorCal = colorPorCalificacion(rubro.calificacion);
  const tieneCriterios = rubro.criterios && rubro.criterios.length > 0;
  const cumpleCount = (rubro.criterios || []).filter((c) => c.cumple === true).length;
  const noCumpleCount = (rubro.criterios || []).filter((c) => c.cumple === false).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.numBadge}>
            <Text style={styles.numBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.areaName} numberOfLines={2}>
            {rubro.nombre}
          </Text>
        </View>
        {!rubro.noAplica && rubro.calificacion != null && (
          <View style={[styles.calBadgeHeader, { backgroundColor: colorCal }]}>
            <Text style={styles.calBadgeHeaderText}>{rubro.calificacion}</Text>
          </View>
        )}
        {rubro.noAplica && (
          <View style={styles.naBadge}>
            <Text style={styles.naBadgeText}>N/A</Text>
          </View>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Switch No aplica */}
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>El C.P.R.S. no cuenta con esta área</Text>
            <Text style={styles.switchHint}>Marca si el centro no tiene este rubro</Text>
          </View>
          <Switch
            value={rubro.noAplica}
            onValueChange={handleNoAplica}
            trackColor={{ false: COLORS.border, true: COLORS.textSecondary }}
            thumbColor={rubro.noAplica ? COLORS.white : COLORS.textLight}
          />
        </View>

        {!rubro.noAplica && (
          <>
            {/* Checklist de criterios va PRIMERO ahora — define el tope */}
            {tieneCriterios && (
              <>
                <View style={styles.criteriosHeader}>
                  <Text style={styles.sectionLabel}>Criterios a evaluar *</Text>
                  <View style={styles.criteriosCounter}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={COLORS.success}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.criteriosCounterText, { color: COLORS.success }]}>
                      {cumpleCount}
                    </Text>
                    <Text style={styles.criteriosCounterSep}> · </Text>
                    <Ionicons
                      name="close-circle"
                      size={14}
                      color={COLORS.error}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.criteriosCounterText, { color: COLORS.error }]}>
                      {noCumpleCount}
                    </Text>
                    <Text style={styles.criteriosCounterSep}>
                      {' '}/ {topeInfo.totalCriterios}
                    </Text>
                  </View>
                </View>
                <View style={styles.criteriosBox}>
                  {rubro.criterios.map((crit, idx) => (
                    <View
                      key={crit.id}
                      style={[
                        styles.criterioRow,
                        idx === rubro.criterios.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
                      ]}
                    >
                      <Text style={styles.criterioTexto}>
                        {idx + 1}. {crit.texto}
                      </Text>
                      <View style={styles.criterioBotones}>
                        <TouchableOpacity
                          style={[
                            styles.criterioBtn,
                            crit.cumple === true && styles.criterioBtnSi,
                          ]}
                          onPress={() => handleCriterio(crit.id, true)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={crit.cumple === true ? COLORS.white : COLORS.success}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.criterioBtnText,
                              crit.cumple === true && styles.criterioBtnTextActive,
                            ]}
                          >
                            SÍ
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.criterioBtn,
                            crit.cumple === false && styles.criterioBtnNo,
                          ]}
                          onPress={() => handleCriterio(crit.id, false)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="close"
                            size={14}
                            color={crit.cumple === false ? COLORS.white : COLORS.error}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.criterioBtnText,
                              crit.cumple === false && styles.criterioBtnTextActive,
                            ]}
                          >
                            NO
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Calificación 1-10 */}
            <View style={styles.califHeader}>
              <Text style={styles.sectionLabel}>Calificación (1 al 10) *</Text>
              {tieneCriterios && (
                <View
                  style={[
                    styles.topePill,
                    {
                      backgroundColor: topeInfo.completos
                        ? colorPorCalificacion(topeInfo.tope) + '22'
                        : COLORS.warningBg,
                      borderColor: topeInfo.completos
                        ? colorPorCalificacion(topeInfo.tope)
                        : COLORS.warning,
                    },
                  ]}
                >
                  <Ionicons
                    name={topeInfo.completos ? 'shield-checkmark' : 'time-outline'}
                    size={12}
                    color={
                      topeInfo.completos
                        ? colorPorCalificacion(topeInfo.tope)
                        : COLORS.warningText || COLORS.warning
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.topePillText,
                      {
                        color: topeInfo.completos
                          ? colorPorCalificacion(topeInfo.tope)
                          : COLORS.warningText || COLORS.warning,
                      },
                    ]}
                  >
                    {topeInfo.completos
                      ? `Máx ${topeInfo.tope} (${topeInfo.cumplidos}/${topeInfo.totalCriterios})`
                      : `Faltan ${topeInfo.totalCriterios - topeInfo.respondidos} criterios`}
                  </Text>
                </View>
              )}
            </View>
            {tieneCriterios && topeInfo.completos && topeInfo.tope < 10 && (
              <Text style={styles.topeHint}>
                Con {topeInfo.cumplidos} de {topeInfo.totalCriterios} criterios cumplidos,
                la calificación máxima posible es {topeInfo.tope}.
              </Text>
            )}
            <View style={styles.califGrid}>
              {CALIFICACIONES.map((n) => {
                const seleccionado = rubro.calificacion === n;
                const colorN = colorPorCalificacion(n);
                const bloqueado =
                  tieneCriterios && (
                    !topeInfo.completos || n > topeInfo.tope
                  );
                return (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.califBtn,
                      seleccionado && { backgroundColor: colorN, borderColor: colorN },
                      bloqueado && !seleccionado && styles.califBtnLocked,
                    ]}
                    onPress={() => handleCalificacion(n)}
                    activeOpacity={0.7}
                  >
                    {bloqueado && !seleccionado && (
                      <Ionicons
                        name="lock-closed"
                        size={10}
                        color={COLORS.textLight}
                        style={styles.califLockIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.califBtnText,
                        seleccionado && styles.califBtnTextActive,
                        bloqueado && !seleccionado && styles.califBtnTextLocked,
                      ]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Switch sin novedad */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Sin novedad</Text>
              <Switch
                value={rubro.sinNovedad}
                onValueChange={handleSinNovedad}
                trackColor={{ false: COLORS.border, true: COLORS.success + '80' }}
                thumbColor={rubro.sinNovedad ? COLORS.success : COLORS.textLight}
              />
            </View>

            {/* Observación */}
            <TextInput
              label="Observación (usa 'Enter' para agregar viñetas)"
              value={rubro.observacion}
              onChangeText={(value) => onUpdate({ observacion: value })}
              placeholder={
                rubro.sinNovedad
                  ? 'Sin novedad.'
                  : 'Describe la observación...\nCada línea se convierte en una viñeta'
              }
              multiline
              numberOfLines={4}
              editable={!rubro.sinNovedad}
              required={!rubro.sinNovedad}
            />

            {/* Fotos */}
            <PhotoPicker
              photos={rubro.fotos}
              onAddPhoto={onAddPhoto}
              onRemovePhoto={onRemovePhoto}
              maxPhotos={8}
            />
          </>
        )}

        {rubro.noAplica && (
          <View style={styles.naInfo}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textSecondary}
              style={styles.naInfoIcon}
            />
            <Text style={styles.naInfoText}>
              Este rubro se marcó como "No aplica". No contará en el promedio general del C.P.R.S.
              Se incluirá una diapositiva informativa en la presentación.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (COLORS, isDark) => StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusLarge,
    marginBottom: SIZES.margin,
    borderWidth: isDark ? 1 : 0,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  numBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  numBadgeText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: SIZES.md,
  },
  areaName: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '700',
    flex: 1,
  },
  calBadgeHeader: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  calBadgeHeaderText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  naBadge: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  naBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  content: {
    padding: SIZES.padding,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: isDark ? 1 : 0,
    borderColor: COLORS.borderSubtle,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: SIZES.base,
    fontWeight: '500',
    color: COLORS.text,
  },
  switchHint: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  califHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  topePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  topeHint: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  califGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.margin,
    gap: 6,
  },
  califBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt || COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  califBtnLocked: {
    backgroundColor: COLORS.disabled || COLORS.background,
    borderColor: COLORS.borderSubtle || COLORS.border,
    opacity: 0.55,
  },
  califLockIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  califBtnText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  califBtnTextActive: {
    color: COLORS.white,
  },
  califBtnTextLocked: {
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  criteriosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  criteriosCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle || COLORS.border,
  },
  criteriosCounterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  criteriosCounterSep: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  criteriosBox: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  criterioRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: (COLORS.border || '#000') + '60',
  },
  criterioTexto: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  criterioBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  criterioBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt || COLORS.surface,
  },
  criterioBtnSi: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  criterioBtnNo: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  criterioBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  criterioBtnTextActive: {
    color: COLORS.white,
  },
  naInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary + '15',
    padding: 14,
    borderRadius: SIZES.borderRadius,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  naInfoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  naInfoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default RubroCard;
