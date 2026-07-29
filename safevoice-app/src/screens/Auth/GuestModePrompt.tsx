// src/screens/Auth/GuestModePrompt.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import Button from '../../components/Button';

interface GuestModePromptProps {
  visible: boolean;
  action: string; // e.g. "like this post", "leave a comment", "vote on this poll"
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export default function GuestModePrompt({ visible, action, onClose, onLogin, onSignup }: GuestModePromptProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={28} color={theme.brandPrimary} />
          </View>

          <Text style={styles.title}>Create an account to continue</Text>
          <Text style={styles.body}>You'll need an account to {action}. It only takes a minute.</Text>

          <Button label="Create account" onPress={onSignup} style={{ marginTop: theme.spacing.lg, width: '100%' }} />
          <Button label="Log in" variant="outline" onPress={onLogin} style={{ marginTop: 10, width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.backgroundPrimary,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.brandPrimaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: theme.spacing.md,
  },
});
