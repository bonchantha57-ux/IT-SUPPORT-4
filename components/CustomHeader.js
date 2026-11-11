import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, FONTS } from '../constants/theme';

export default function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryDark, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.titleSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={30} color="#FFFFFF" />
          </View>
          <View style={styles.titleContent}>
            <View style={styles.tagWrapper}>
              <Text style={styles.tagText}>IT SUPPORT REGISTRATION</Text>
            </View>
            <Text style={styles.title}>បំពេញ ទិន្នន័យ</Text>
            <Text style={styles.subtitle}>
              ទម្រង់ចុះឈ្មោះ និងប្រមូលព័ត៌មានបេក្ខជនផ្នែក IT Support
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  titleContent: {
    flex: 1,
  },
  tagWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: FONTS.khmer,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontFamily: FONTS.khmer,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#E2E8F0',
    marginTop: 4,
    lineHeight: 20,
    fontFamily: FONTS.khmer,
  },
});
