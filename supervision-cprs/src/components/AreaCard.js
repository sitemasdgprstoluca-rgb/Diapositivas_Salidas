import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import TextInput from './TextInput';
import Select from './Select';
import PhotoPicker from './PhotoPicker';
import { AREAS_PREDEFINIDAS } from '../constants/data';

const AreaCard = ({
  area,
  index,
  onUpdate,
  onRemove,
  onAddPhoto,
  onRemovePhoto,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}) => {
  // Estado para manejar si se seleccionó "Otro"
  const [esOtro, setEsOtro] = useState(false);
  const [nombrePersonalizado, setNombrePersonalizado] = useState('');

  // Detectar si el nombre actual no está en las áreas predefinidas (es personalizado)
  useEffect(() => {
    if (area.nombre && !AREAS_PREDEFINIDAS.includes(area.nombre)) {
      setEsOtro(true);
      setNombrePersonalizado(area.nombre);
    } else if (area.nombre === 'Otro') {
      setEsOtro(true);
    }
  }, []);

  const handleAreaChange = (value) => {
    if (value === 'Otro') {
      setEsOtro(true);
      setNombrePersonalizado('');
      // No actualizamos el nombre aún, esperamos que escriban
    } else {
      setEsOtro(false);
      setNombrePersonalizado('');
      onUpdate({ nombre: value });
    }
  };

  const handleNombrePersonalizado = (value) => {
    setNombrePersonalizado(value);
    onUpdate({ nombre: value || 'Otro' });
  };

  const handleSinNovedad = (value) => {
    onUpdate({
      sinNovedad: value,
      observacion: value ? 'Sin novedad.' : '',
    });
  };

  const confirmRemove = () => {
    Alert.alert(
      'Eliminar área',
      `¿Estás seguro de eliminar el área "${area.nombre || 'Sin nombre'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.areaNumber}>Área {index + 1}</Text>
          {area.nombre && (
            <Text style={styles.areaName} numberOfLines={1}>
              {area.nombre}
            </Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {/* Botones de reordenar */}
          <TouchableOpacity
            style={[styles.moveButton, !canMoveUp && styles.moveButtonDisabled]}
            onPress={onMoveUp}
            disabled={!canMoveUp}
          >
            <Text style={styles.moveButtonText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.moveButton, !canMoveDown && styles.moveButtonDisabled]}
            onPress={onMoveDown}
            disabled={!canMoveDown}
          >
            <Text style={styles.moveButtonText}>▼</Text>
          </TouchableOpacity>
          
          {/* Botón eliminar */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={confirmRemove}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Selector de área */}
        <Select
          label="Nombre del área"
          value={esOtro ? 'Otro' : area.nombre}
          options={AREAS_PREDEFINIDAS}
          onSelect={handleAreaChange}
          placeholder="Seleccionar área..."
          required
        />

        {/* Campo personalizado cuando se selecciona "Otro" */}
        {esOtro && (
          <View style={styles.otroContainer}>
            <TextInput
              label="Especifica el área"
              value={nombrePersonalizado}
              onChangeText={handleNombrePersonalizado}
              placeholder="Escribe el nombre del área..."
              required
              style={styles.otroInput}
            />
            <TouchableOpacity 
              style={styles.cancelarOtro}
              onPress={() => {
                setEsOtro(false);
                setNombrePersonalizado('');
                onUpdate({ nombre: '' });
              }}
            >
              <Text style={styles.cancelarOtroText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Switch sin novedad */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Sin novedad</Text>
          <Switch
            value={area.sinNovedad}
            onValueChange={handleSinNovedad}
            trackColor={{ false: COLORS.border, true: COLORS.success + '80' }}
            thumbColor={area.sinNovedad ? COLORS.success : COLORS.textLight}
          />
        </View>

        {/* Observación - soporte para viñetas (separar con 'Enter' para múltiples puntos) */}
        <TextInput
          label="Observación (usa 'Enter' para agregar viñetas)"
          value={area.observacion}
          onChangeText={(value) => onUpdate({ observacion: value })}
          placeholder={area.sinNovedad ? 'Sin novedad.' : 'Describe la observación...\nCada línea se convierte en una viñeta'}
          multiline
          numberOfLines={4}
          editable={!area.sinNovedad}
          required={!area.sinNovedad}
        />

        {/* Fotos */}
        <PhotoPicker
          photos={area.fotos}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
          maxPhotos={8}
        />
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
  areaNumber: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  areaName: {
    fontSize: SIZES.md,
    color: COLORS.accent,
    marginLeft: 8,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonDisabled: {
    opacity: 0.4,
  },
  moveButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  removeButton: {
    width: 32,
    height: 28,
    borderRadius: 4,
    backgroundColor: COLORS.error + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  removeButtonText: {
    fontSize: 14,
  },
  content: {
    padding: SIZES.padding,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
  },
  switchLabel: {
    fontSize: SIZES.base,
    fontWeight: '500',
    color: COLORS.text,
  },
  otroContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -8,
    marginBottom: 8,
  },
  otroInput: {
    flex: 1,
    marginRight: 8,
  },
  cancelarOtro: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  cancelarOtroText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default AreaCard;
