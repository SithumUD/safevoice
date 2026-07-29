// src/components/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

type BadgeVariant = 'category' | 'trending' | 'anonymous' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  category: { bg: theme.colors.amber50, text: theme.colors.amber600 },
  trending: { bg: theme.trendingLight, text: theme.trendingText },
  anonymous: { bg: theme.anonymousLight, text: theme.anonymousText },
  neutral: { bg: theme.colors.gray50, text: theme.colors.gray600 },
};

export default function Badge({ label, variant = 'neutral', icon }: BadgeProps) {
  const s = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      {icon && <Ionicons name={icon} size={12} color={s.text} style={{ marginRight: 4 }} />}
      <Text style={[styles.label, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
});
