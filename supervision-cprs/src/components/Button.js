import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  style = {},
  textStyle = {},
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textDefault;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : COLORS.white} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), getTextSizeStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadius,
    ...SHADOWS.small,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  sizeLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  textDefault: {
    color: COLORS.white,
    fontWeight: '600',
  },
  textOutline: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: SIZES.sm,
  },
  textMedium: {
    fontSize: SIZES.base,
  },
  textLarge: {
    fontSize: SIZES.lg,
  },
});

export default Button;
