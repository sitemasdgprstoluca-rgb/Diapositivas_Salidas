import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  const { colors, isDark } = useTheme();
  const COLORS = colors;
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
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
            <Ionicons
              name={tipo === 'pdf' ? 'document-text-outline' : 'bar-chart-outline'}
              size={48}
              color={COLORS.primary}
            />
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

const createStyles = (COLORS, isDark) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: isDark ? 1 : 0,
    borderColor: COLORS.borderSubtle,
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
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  aviso: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
