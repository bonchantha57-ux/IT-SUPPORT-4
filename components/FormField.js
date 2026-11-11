import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

export default function FormField({
  label,
  value = '',
  onChangeText,
  placeholder,
  iconName,
  required = false,
  error = null,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  hint,
  prefix,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onChangeText) onChangeText('');
  };

  const hasValue = Boolean(value && value.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label} {required ? <Text style={styles.required}>*</Text> : null}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {iconName ? (
          <View style={styles.iconWrapper}>
            <Ionicons
              name={iconName}
              size={20}
              color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        ) : null}

        {prefix ? (
          <Text style={styles.prefixText}>{prefix}</Text>
        ) : null}

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {hasValue ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.khmer,
  },
  required: {
    color: COLORS.error,
    fontSize: 15,
  },
  hint: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontFamily: FONTS.khmer,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)' }
      : {}),
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  iconWrapper: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: FONTS.khmer,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.text,
    height: '100%',
    paddingVertical: 4,
    fontFamily: FONTS.khmer,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.khmer,
  },
});
