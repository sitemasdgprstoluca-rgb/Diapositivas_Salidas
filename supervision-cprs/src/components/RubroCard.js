import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { colorPorCalificacion } from '../constants/data';
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
  const handleNoAplica = (value) => {
    onUpdate({
      noAplica: value,
      calificacion: value ? null : rubro.calificacion,
      sinNovedad: value ? false : rubro.sinNovedad,
      observacion: value ? '' : rubro.observacion,
    });
  };

  const handleCalificacion = (valor) => {
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
  };

  const colorCal = colorPorCalificacion(rubro.calificacion);
  const tieneCriterios = rubro.criterios && rubro.criterios.length > 0;

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
            {/* Calificación 1-10 */}
            <Text style={styles.sectionLabel}>Calificación (1 al 10) *</Text>
            <View style={styles.califGrid}>
              {CALIFICACIONES.map((n) => {
                const seleccionado = rubro.calificacion === n;
                const colorN = colorPorCalificacion(n);
                return (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.califBtn,
                      seleccionado && { backgroundColor: colorN, borderColor: colorN },
                    ]}
                    onPress={() => handleCalificacion(n)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.califBtnText,
                        seleccionado && styles.califBtnTextActive,
                      ]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Checklist de criterios */}
            {tieneCriterios && (
              <>
                <Text style={styles.sectionLabel}>Criterios a evaluar *</Text>
                <View style={styles.criteriosBox}>
                  {rubro.criterios.map((crit, idx) => (
                    <View key={crit.id} style={styles.criterioRow}>
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
                        >
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
                        >
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
            <Text style={styles.naInfoIcon}>ℹ️</Text>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusLarge,
    marginBottom: SIZES.margin,
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
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  califBtnText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  califBtnTextActive: {
    color: COLORS.white,
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
    borderBottomColor: COLORS.border + '60',
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
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
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
    fontSize: 18,
    marginRight: 10,
  },
  naInfoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default RubroCard;
