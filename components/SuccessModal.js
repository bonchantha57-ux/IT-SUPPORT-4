import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, FONTS } from '../constants/theme';

export default function SuccessModal({
  visible,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Checkmark Icon Circle */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.gradientCircle}
          >
            <Ionicons name="checkmark-sharp" size={44} color="#FFFFFF" />
          </LinearGradient>

          {/* Simple Success Text */}
          <Text style={styles.successTitle}>បញ្ចូលទិន្នន័យបាន Success! 🎉</Text>
          <Text style={styles.successSubtitle}>
            ព័ត៌មានរបស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងប្រព័ន្ធរួចរាល់ហើយ
          </Text>

          {/* Single OK Button */}
          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.okButtonText}>យល់ព្រម</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(6px)' } : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  gradientCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    ...SHADOWS.button,
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.khmer,
  },
  successSubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: FONTS.khmer,
  },
  okButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.khmer,
  },
});
