import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { PURPOSE_SUGGESTIONS } from '../constants/defaultSkills';

export default function PurposeSelector({
  value,
  onChangeText,
  error = null,
  maxLength = 500,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const applySuggestion = (text) => {
    if (!value || !value.trim()) {
      onChangeText(text);
    } else {
      onChangeText(value + '\n• ' + text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          គោលបំណងនៃការចូលមកជា IT Support <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.charCount}>
          {value ? value.length : 0}/{maxLength}
        </Text>
      </View>

      <Text style={styles.subtitle}>
        បញ្ជាក់ពីបំណងប្រាថ្នា គោលដៅការងារ ឬហេតុផលដែលចង់ក្លាយជា IT Support
      </Text>

      {/* Suggestion Pills */}
      <View style={styles.suggestionsWrapper}>
        <Text style={styles.suggestionTitle}>
          <Ionicons name="bulb-outline" size={14} color={COLORS.warning} /> គំរូគោលបំណងរហ័ស (ចុចដើម្បីជ្រើស)៖
        </Text>
        <View style={styles.pillsList}>
          {PURPOSE_SUGGESTIONS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.pill}
              onPress={() => applySuggestion(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={13} color={COLORS.primary} />
              <Text style={styles.pillText} numberOfLines={2}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.textAreaContainer,
          isFocused && styles.textAreaFocused,
          error && styles.textAreaError,
        ]}
      >
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={value}
          onChangeText={onChangeText}
          placeholder="សរសេររៀបរាប់ពីគោលបំណងរបស់អ្នកនៅទីនេះ..."
          placeholderTextColor={COLORS.textMuted}
          maxLength={maxLength}
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
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
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    fontFamily: FONTS.khmer,
  },
  required: {
    color: COLORS.error,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontFamily: FONTS.khmer,
  },
  subtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontFamily: FONTS.khmer,
  },
  suggestionsWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: FONTS.khmer,
  },
  pillsList: {
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    flex: 1,
    fontFamily: FONTS.khmer,
  },
  textAreaContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    minHeight: 110,
  },
  textAreaFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)' }
      : {}),
  },
  textAreaError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  textArea: {
    fontSize: 14,
    color: COLORS.text,
    minHeight: 85,
    lineHeight: 22,
    padding: 0,
    fontFamily: FONTS.khmer,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.khmer,
  },
});
