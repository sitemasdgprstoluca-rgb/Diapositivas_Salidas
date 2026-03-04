import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const PhotoPicker = ({
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 10,
  style = {},
}) => {
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Se necesitan permisos de cámara y galería para agregar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (photos.length >= maxPhotos) {
      Alert.alert('Límite alcanzado', `Máximo ${maxPhotos} fotos por área.`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onAddPhoto({
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto.');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (photos.length >= maxPhotos) {
      Alert.alert('Límite alcanzado', `Máximo ${maxPhotos} fotos por área.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
        quality: 0.7,
        exif: true,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach(asset => {
          onAddPhoto({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            timestamp: new Date().toISOString(),
          });
        });
      }
    } catch (error) {
      console.error('Error seleccionando foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto.');
    }
  };

  const confirmRemove = (index) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que deseas eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onRemovePhoto(index) },
      ]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Agregar foto',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Tomar foto', onPress: takePhoto },
        { text: '🖼️ Galería', onPress: pickFromGallery },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        Evidencia fotográfica ({photos.length}/{maxPhotos}) <Text style={styles.requiredMark}>*</Text>
      </Text>
      {photos.length === 0 && (
        <Text style={styles.requiredHint}>Se requiere al menos una foto</Text>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosContainer}
      >
        {photos.map((photo, index) => (
          <View key={`photo-${index}-${photo.timestamp}`} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => confirmRemove(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showPhotoOptions}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonIcon}>📷</Text>
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  requiredMark: {
    color: COLORS.error,
    fontWeight: '700',
  },
  requiredHint: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  photosContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.border,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  addButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PhotoPicker;
