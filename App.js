import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from './components/CustomHeader';
import FormField from './components/FormField';
import SkillSelector from './components/SkillSelector';
import PurposeSelector from './components/PurposeSelector';
import SuccessModal from './components/SuccessModal';

import { COLORS, SHADOWS, FONTS } from './constants/theme';
import { GOOGLE_SCRIPT_WEBHOOK_URL } from './config';
import { submitToGoogleSheet } from './services/sheetService';

export default function App() {
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [purpose, setPurpose] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState({});

  // App States
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'សូមបញ្ចូលឈ្មោះរបស់អ្នក';
    } else if (name.trim().length < 2) {
      newErrors.name = 'ឈ្មោះត្រូវមានយ៉ាងតិច ២ តួអក្សរ';
    }

    if (!phone.trim()) {
      newErrors.phone = 'សូមបញ្ចូលលេខទូរស័ព្ធ';
    } else {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
        newErrors.phone = 'ទម្រង់លេខទូរស័ព្ធមិនត្រឹមត្រូវ (ឧទាហរណ៍: 012 345 678)';
      }
    }

    if (!telegram.trim()) {
      newErrors.telegram = 'សូមបញ្ចូល Username Telegram';
    }

    if (!email.trim()) {
      newErrors.email = 'សូមបញ្ចូលអ៊ីមែល (Email)';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (ឧទាហរណ៍: name@gmail.com)';
    }

    if (selectedSkills.length === 0) {
      newErrors.skill = 'សូមជ្រើសរើសយ៉ាងហោចណាស់ជំនាញចំនួនមួយ';
    }

    if (!purpose.trim()) {
      newErrors.purpose = 'សូមបញ្ជាក់ពីគោលបំណងនៃការចូលមកជា IT Support';
    } else if (purpose.trim().length < 10) {
      newErrors.purpose = 'គោលបំណងត្រូវមានយ៉ាងតិច ១០ តួអក្សរ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    let cleanTelegram = telegram.trim();
    if (cleanTelegram && !cleanTelegram.startsWith('@')) {
      cleanTelegram = '@' + cleanTelegram;
    }

    const formData = {
      name: name.trim(),
      phone: phone.trim(),
      telegram: cleanTelegram,
      email: email.trim().toLowerCase(),
      skill: selectedSkills.join(', '),
      purpose: purpose.trim(),
    };

    const result = await submitToGoogleSheet(formData, GOOGLE_SCRIPT_WEBHOOK_URL);

    setSubmitting(false);

    if (result.success) {
      setShowSuccessModal(true);
      handleReset();
    } else {
      const errMsg = result.message || 'មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យ';
      if (Platform.OS === 'web') {
        window.alert(errMsg);
      } else {
        Alert.alert('បរាជ័យ', errMsg);
      }
    }
  };

  // Reset form
  const handleReset = () => {
    setName('');
    setPhone('');
    setTelegram('');
    setEmail('');
    setSelectedSkills([]);
    setPurpose('');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGradientStart} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Responsive Centered Wrapper */}
          <View style={styles.responsiveWrapper}>
            {/* Header */}
            <CustomHeader />

            {/* Main Form Card */}
            <View style={styles.formCard}>
              <View style={styles.formCardHeader}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                <Text style={styles.formCardTitle}>ព័ត៌មានបេក្ខជន</Text>
                <View style={styles.badgeRequired}>
                  <Text style={styles.badgeRequiredText}>* ចាំបាច់</Text>
                </View>
              </View>

              {/* 1. ឈ្មោះ (Full Name) */}
              <FormField
                label="ឈ្មោះ (Full Name)"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="ឧ. សុខ ចាន់ថា ឬ Sok Chantha"
                iconName="person"
                required
                error={errors.name}
              />

              {/* 2. លេខទូរស័ព្ធ (Phone Number) */}
              <FormField
                label="លេខទូរស័ព្ធ (Phone Number)"
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                placeholder="ឧ. 012 345 678 / 098 888 999"
                iconName="call"
                keyboardType="phone-pad"
                required
                error={errors.phone}
              />

              {/* 3. Username Telegram */}
              <FormField
                label="Username Telegram"
                value={telegram}
                onChangeText={(val) => {
                  setTelegram(val);
                  if (errors.telegram) setErrors({ ...errors, telegram: null });
                }}
                placeholder="ឧ. chantha_it ឬ @chantha_it"
                iconName="paper-plane"
                autoCapitalize="none"
                required
                error={errors.telegram}
              />

              {/* 4. Email */}
              <FormField
                label="Email (អ៊ីមែល)"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="ឧ. chantha.it@gmail.com"
                iconName="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                required
                error={errors.email}
              />

              {/* 5. ជំនាញស្រឡាញ់ (Preferred Skills) */}
              <SkillSelector
                selectedSkills={selectedSkills}
                onSkillsChange={(skills) => {
                  setSelectedSkills(skills);
                  if (errors.skill) setErrors({ ...errors, skill: null });
                }}
                error={errors.skill}
              />

              {/* 6. គោលបំណងនៃការចូលមកជា IT Support */}
              <PurposeSelector
                value={purpose}
                onChangeText={(val) => {
                  setPurpose(val);
                  if (errors.purpose) setErrors({ ...errors, purpose: null });
                }}
                error={errors.purpose}
              />

              {/* Action Buttons */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  disabled={submitting}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={17} color={COLORS.textSecondary} />
                  <Text style={styles.resetButtonText}>សម្អាត</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.primaryGradientStart, COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {submitting ? (
                      <View style={styles.submittingRow}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>កំពុងបញ្ជូនទិន្នន័យ...</Text>
                      </View>
                    ) : (
                      <View style={styles.submittingRow}>
                        <Ionicons name="cloud-upload" size={19} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>បញ្ជូនទិន្នន័យ</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerNote}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.textMuted} />
              <Text style={styles.footerNoteText}>
                ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាព និងបញ្ជូនទៅកាន់ Google Sheet ផ្ទាល់
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Platform.OS === 'web' ? 32 : 16,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 14,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 680,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: Platform.OS === 'web' ? 28 : 18,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  formCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    fontFamily: FONTS.khmer,
  },
  badgeRequired: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRequiredText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.khmer,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  resetButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontFamily: FONTS.khmer,
  },
  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: FONTS.khmer,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  footerNoteText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: FONTS.khmer,
  },
});
