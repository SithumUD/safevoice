// src/screens/Report/ReportContentModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { reportsService, SubmitReportPayload } from '../../services/reportsService';
import { theme } from '../../theme';

// ─── Types ──────────────────────────────────────────────────────────────────

type ReportReason = SubmitReportPayload['reason'];

interface ReasonOption {
  value: ReportReason;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {
    value: 'SPAM',
    label: 'Spam or irrelevant',
    icon: 'mail-unread-outline',
    description: 'Repetitive, off-topic, or promotional content',
  },
  {
    value: 'HARASSMENT',
    label: 'Harassment or bullying',
    icon: 'hand-left-outline',
    description: 'Targeted abuse, threats, or intimidation',
  },
  {
    value: 'MISINFORMATION',
    label: 'Misinformation',
    icon: 'alert-circle-outline',
    description: 'Intentionally false or misleading claims',
  },
  {
    value: 'HATE_SPEECH',
    label: 'Hate speech',
    icon: 'warning-outline',
    description: 'Content attacking people based on identity',
  },
  {
    value: 'OTHER',
    label: 'Other',
    icon: 'ellipsis-horizontal-circle-outline',
    description: 'Something else not listed above',
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ReportContentModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'TOPIC' | 'COMMENT' | 'USER';
  /** The actual ID of the entity being reported */
  targetId: string;
  /**
   * For COMMENT reports the backend also needs the parent topicId.
   * For TOPIC / USER reports, pass `undefined`.
   */
  parentTopicId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReportContentModal({
  visible,
  onClose,
  targetType,
  targetId,
  parentTopicId,
}: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    // Reset state on close
    setSelectedReason(null);
    setDetails('');
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const payload: SubmitReportPayload = {
      targetType,
      reason: selectedReason,
      details: details.trim() || undefined,
    };

    if (targetType === 'TOPIC') {
      payload.targetTopicId = targetId;
    } else if (targetType === 'COMMENT') {
      payload.targetCommentId = targetId;
      if (parentTopicId) payload.targetTopicId = parentTopicId;
    } else if (targetType === 'USER') {
      payload.targetUserId = targetId;
    }

    setSubmitting(true);
    try {
      await reportsService.submitReport(payload);
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert(
        'Report Failed',
        err?.message ?? 'Failed to submit report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <Pressable style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {submitted ? (
              // ── Success state ──
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={52} color={theme.agree} />
                </View>
                <Text style={styles.successTitle}>Report Submitted</Text>
                <Text style={styles.successMessage}>
                  Thank you for keeping SafeVoice safe. Our moderation team will review it shortly.
                </Text>
                <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Form state ──
              <>
                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={styles.headerTitle}>Report Content</Text>
                    <Text style={styles.headerSubtitle}>Why are you reporting this?</Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
                    <Ionicons name="close" size={22} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.body}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Reason list */}
                  <View style={styles.reasonList}>
                    {REASON_OPTIONS.map((option) => {
                      const active = selectedReason === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[styles.reasonRow, active && styles.reasonRowActive]}
                          activeOpacity={0.75}
                          onPress={() => setSelectedReason(option.value)}
                        >
                          <View style={[styles.reasonIconWrap, active && styles.reasonIconWrapActive]}>
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={active ? theme.brandPrimary : theme.textSecondary}
                            />
                          </View>
                          <View style={styles.reasonText}>
                            <Text style={[styles.reasonLabel, active && styles.reasonLabelActive]}>
                              {option.label}
                            </Text>
                            <Text style={styles.reasonDesc}>{option.description}</Text>
                          </View>
                          {active && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.brandPrimary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Optional details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Additional details (optional)</Text>
                    <TextInput
                      style={styles.detailsInput}
                      placeholder="Tell us more about the issue…"
                      placeholderTextColor={theme.textTertiary}
                      value={details}
                      onChangeText={setDetails}
                      multiline
                      maxLength={500}
                      numberOfLines={3}
                    />
                    <Text style={styles.charCount}>{details.length}/500</Text>
                  </View>
                </ScrollView>

                {/* Submit */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!selectedReason || submitting) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedReason || submitting}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={theme.textOnPrimary} />
                    ) : (
                      <>
                        <Ionicons name="flag-outline" size={16} color={theme.textOnPrimary} />
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.backgroundPrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.borderStrong,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },

  // Body
  body: {
    flexGrow: 0,
  },

  // Reason rows
  reasonList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    gap: 12,
    backgroundColor: theme.backgroundPrimary,
  },
  reasonRowActive: {
    borderColor: theme.brandPrimary,
    backgroundColor: theme.brandPrimaryLight,
  },
  reasonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonIconWrapActive: {
    backgroundColor: `${theme.brandPrimary}20`,
  },
  reasonText: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
  },
  reasonLabelActive: {
    color: theme.brandPrimaryDark,
  },
  reasonDesc: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 1,
  },

  // Details
  detailsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  detailsLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: 12,
    padding: 12,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  submitButton: {
    backgroundColor: theme.brandPrimary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    color: theme.textOnPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },

  // Success state
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.agreeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  successMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: theme.brandPrimary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  doneButtonText: {
    color: theme.textOnPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
