import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 60 }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blurContainer}>
        <View style={styles.glassOverlay}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.glass.white,
  },
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  glassOverlay: {
    flex: 1,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.whiteStrong,
    borderRadius: 20,
  },
});