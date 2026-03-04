import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Select = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Seleccionar',
  error,
  required = false,
  allowCustom = false,
  style = {},
}) => {
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : value || placeholder;

  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option.value;
    onSelect(val);
    setShowModal(false);
  };

  const renderOption = ({ item }) => {
    const optLabel = typeof item === 'string' ? item : item.label;
    const optValue = typeof item === 'string' ? item : item.value;
    const isSelected = optValue === value;

    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => handleSelect(item)}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {optLabel}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
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
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.inputText, 
            (!value || value === placeholder) && styles.placeholder
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Seleccionar'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item, index) => 
                typeof item === 'string' ? item : item.value || index.toString()
              }
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  arrow: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusLarge,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  optionText: {
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default Select;
