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
import { IT_SKILLS } from '../constants/defaultSkills';

export default function SkillSelector({
  selectedSkills = [],
  onSkillsChange,
  error = null,
}) {
  const [customInput, setCustomInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skillName));
    } else {
      onSkillsChange([...selectedSkills, skillName]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      onSkillsChange([...selectedSkills, trimmed]);
      setCustomInput('');
    }
  };

  const removeSkill = (skillName) => {
    onSkillsChange(selectedSkills.filter((s) => s !== skillName));
  };

  const hasSelected = selectedSkills && selectedSkills.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          ជំនាញស្រឡាញ់ <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.countBadge}>
          {selectedSkills.length} បានជ្រើសរើស
        </Text>
      </View>
      <Text style={styles.subtitle}>
        ចុចជ្រើសរើសជំនាញដែលអ្នកពេញចិត្ត ឬបន្ថែមជំនាញផ្ទាល់ខ្លួន៖
      </Text>

      {/* Preset IT Skill Badges */}
      <View style={styles.chipsContainer}>
        {IT_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill.name);
          return (
            <TouchableOpacity
              key={skill.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => toggleSkill(skill.name)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={skill.icon}
                size={16}
                color={isSelected ? '#FFFFFF' : COLORS.primary}
              />
              <Text
                style={[styles.chipText, isSelected && styles.chipTextActive]}
              >
                {skill.name}
              </Text>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Skill Input */}
      <View
        style={[
          styles.customInputContainer,
          isFocused && styles.customInputFocused,
        ]}
      >
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <TextInput
          style={styles.customTextInput}
          placeholder="វាយបញ្ចូលជំនាញផ្សេងទៀត (ឧទាហរណ៍: Linux, Python...)"
          placeholderTextColor={COLORS.textMuted}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={addCustomSkill}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !customInput.trim() && styles.addButtonDisabled,
          ]}
          onPress={addCustomSkill}
          disabled={!customInput.trim()}
        >
          <Text style={styles.addButtonText}>បន្ថែម</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Tags list */}
      {hasSelected ? (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>ជំនាញដែលបានជ្រើសរើស៖</Text>
          <View style={styles.tagsWrapper}>
            {selectedSkills.map((item, idx) => (
              <View key={idx} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removeSkill(item)}
                  style={styles.removeTagBtn}
                >
                  <Ionicons name="close" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : null}

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
    marginBottom: 18,
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
    fontFamily: FONTS.khmer,
  },
  required: {
    color: COLORS.error,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontFamily: FONTS.khmer,
  },
  subtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontFamily: FONTS.khmer,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.khmer,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 10,
  },
  customInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  customTextInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.text,
    height: '100%',
    paddingVertical: 4,
    fontFamily: FONTS.khmer,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FONTS.khmer,
  },
  selectedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: FONTS.khmer,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: FONTS.khmer,
  },
  removeTagBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
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
