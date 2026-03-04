import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';
import { formatearFechaCompleta, formatearHora } from '../utils/dateUtils';

const DateTimeInput = ({
  label,
  value,
  onChange,
  mode = 'date', // date, time, datetime
  error,
  required = false,
  placeholder = 'Seleccionar',
  style = {},
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState(mode === 'datetime' ? 'date' : mode);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      if (mode === 'datetime' && pickerMode === 'date') {
        // Si estamos en modo datetime y acabamos de seleccionar fecha, mostrar hora
        setPickerMode('time');
        onChange(selectedDate);
        if (Platform.OS === 'android') {
          setTimeout(() => setShowPicker(true), 100);
        }
      } else {
        onChange(selectedDate);
        if (Platform.OS === 'android') {
          setShowPicker(false);
        }
        if (mode === 'datetime') {
          setPickerMode('date');
        }
      }
    }
  };

  const showDatepicker = () => {
    setPickerMode(mode === 'datetime' ? 'date' : mode);
    setShowPicker(true);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    switch (mode) {
      case 'time':
        return formatearHora(value);
      case 'datetime':
        return `${formatearFechaCompleta(value)} ${formatearHora(value)}`;
      default:
        return formatearFechaCompleta(value);
    }
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerMode(mode === 'datetime' ? 'date' : mode);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={showDatepicker}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {getDisplayValue()}
        </Text>
        <Text style={styles.icon}>
          {mode === 'time' ? '🕐' : '📅'}
        </Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.modalButton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={[styles.modalButton, styles.modalButtonDone]}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode={pickerMode}
                display="spinner"
                onChange={handleChange}
                locale="es-ES"
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
          locale="es-ES"
        />
      )}
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
    marginBottom: SIZES.marginSmall,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    flex: 1,
  },
  placeholder: {
    color: COLORS.textLight,
  },
  icon: {
    fontSize: 20,
    marginLeft: 8,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.borderRadiusLarge,
    borderTopRightRadius: SIZES.borderRadiusLarge,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalButton: {
    fontSize: SIZES.base,
    color: COLORS.error,
    fontWeight: '500',
  },
  modalButtonDone: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DateTimeInput;
