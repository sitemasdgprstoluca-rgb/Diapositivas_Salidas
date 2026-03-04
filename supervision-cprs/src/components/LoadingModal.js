import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/theme';

const MENSAJES_PPTX = [
  'Preparando presentación...',
  'Cargando fondos...',
  'Procesando fotografías...',
  'Añadiendo áreas supervisadas...',
  'Generando diapositivas...',
  'Finalizando documento...',
  '¡Casi listo!',
];

const MENSAJES_PDF = [
  'Preparando documento...',
  'Procesando contenido...',
  'Generando PDF...',
  '¡Casi listo!',
];

export default function LoadingModal({ visible, tipo = 'pptx' }) {
  const [mensajeIndex, setMensajeIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];
  
  const mensajes = tipo === 'pdf' ? MENSAJES_PDF : MENSAJES_PPTX;

  useEffect(() => {
    if (!visible) {
      setMensajeIndex(0);
      return;
    }

    const intervalo = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMensajeIndex(prev => (prev + 1) % mensajes.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearInterval(intervalo);
  }, [visible, mensajes.length]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              {tipo === 'pdf' ? '📄' : '📊'}
            </Text>
          </View>
          
          <Text style={styles.titulo}>
            {tipo === 'pdf' ? 'Generando PDF' : 'Generando PowerPoint'}
          </Text>
          
          <ActivityIndicator 
            size="large" 
            color={COLORS.primary} 
            style={styles.spinner}
          />
          
          <Animated.Text style={[styles.mensaje, { opacity: fadeAnim }]}>
            {mensajes[mensajeIndex]}
          </Animated.Text>
          
          <Text style={styles.aviso}>
            Por favor espera, esto puede tardar unos segundos...
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  mensaje: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  aviso: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
