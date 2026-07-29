// src/screens/Home/CreateTopicScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { TopicCategory } from '../../types/api';
import { topicsService, CreateTopicPayload } from '../../services/topicsService';
import { uploadToCloudinary, validateMedia } from '../../utils/cloudinary';
import { theme } from '../../theme';
import { getAuthState } from '../../store/authStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: TopicCategory; label: string; icon: string }[] = [
  { value: 'CIVIC', label: 'Civic', icon: '🏛️' },
  { value: 'SAFETY', label: 'Safety', icon: '🛡️' },
  { value: 'EDUCATION', label: 'Education', icon: '📚' },
  { value: 'COMMUNITY', label: 'Community', icon: '🤝' },
  { value: 'GENERAL', label: 'General', icon: '💬' },
  { value: 'POLLS', label: 'Polls', icon: '📊' },
];

const TITLE_MAX = 255;
const DESC_MAX = 5000;
const POLL_OPTIONS_MIN = 2;
const POLL_OPTIONS_MAX = 6;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTopicScreen({ navigation }: any) {
  // Form state
  const [category, setCategory] = useState<TopicCategory>('GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Media state
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);

  // Poll state
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated } = getAuthState();
  const scrollRef = useRef<ScrollView>(null);

  // ── Validation ──────────────────────────────────────────────────────────────

  const isValid =
    title.trim().length >= 10 &&
    description.trim().length >= 20 &&
    (!hasPoll ||
      (pollQuestion.trim().length > 0 &&
        pollOptions.filter((o) => o.trim().length > 0).length >= POLL_OPTIONS_MIN));

  // ── Media picker ────────────────────────────────────────────────────────────

  const handlePickMedia = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to attach media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      allowsEditing: true,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const type: 'image' | 'video' = asset.type === 'video' ? 'video' : 'image';

    const validation = await validateMedia(asset.uri, type, asset.fileSize ?? undefined, asset.duration ?? undefined);
    if (!validation.valid) {
      Alert.alert('Media Error', validation.error ?? 'Invalid media file');
      return;
    }

    setMediaUri(asset.uri);
    setMediaType(type);
    setUploadedMediaUrl(null); // Reset so it re-uploads on submit

    // Pre-upload in background
    setUploadingMedia(true);
    try {
      const url = await uploadToCloudinary(asset.uri, type);
      setUploadedMediaUrl(url);
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message ?? 'Could not upload media. You can try again.');
    } finally {
      setUploadingMedia(false);
    }
  }, []);

  const handleRemoveMedia = useCallback(() => {
    setMediaUri(null);
    setMediaType(null);
    setUploadedMediaUrl(null);
  }, []);

  // ── Poll helpers ────────────────────────────────────────────────────────────

  const addPollOption = useCallback(() => {
    if (pollOptions.length < POLL_OPTIONS_MAX) {
      setPollOptions((prev) => [...prev, '']);
    }
  }, [pollOptions.length]);

  const removePollOption = useCallback((index: number) => {
    if (pollOptions.length > POLL_OPTIONS_MIN) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  }, [pollOptions.length]);

  const updatePollOption = useCallback((index: number, value: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please log in to create a topic.');
      return;
    }

    // Ensure media upload finished
    if (mediaUri && !uploadedMediaUrl && !uploadingMedia) {
      Alert.alert('Media Uploading', 'Please wait for the media to finish uploading.');
      return;
    }

    if (mediaUri && uploadingMedia) {
      Alert.alert('Please Wait', 'Media is still uploading. Please wait a moment.');
      return;
    }

    const validOptions = pollOptions.filter((o) => o.trim().length > 0);

    const payload: CreateTopicPayload = {
      category,
      title: title.trim(),
      description: description.trim(),
      isAnonymous,
      mediaUrl: uploadedMediaUrl ?? null,
      mediaType: mediaType ? mediaType.toUpperCase() as 'IMAGE' | 'VIDEO' : null,
      poll: hasPoll && pollQuestion.trim()
        ? {
            question: pollQuestion.trim(),
            options: validOptions,
            isMultipleChoice: false,
          }
        : null,
    };

    setSubmitting(true);
    try {
      await topicsService.createTopic(payload);
      Alert.alert('Posted! 🎉', 'Your topic has been published to the community.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Failed to Post', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    isValid, submitting, isAuthenticated, mediaUri, uploadedMediaUrl, uploadingMedia,
    category, title, description, isAnonymous, mediaType, hasPoll, pollQuestion, pollOptions, navigation,
  ]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Discussion</Text>
        <TouchableOpacity
          style={[styles.publishBtn, (!isValid || submitting) && styles.publishBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.textOnPrimary} />
          ) : (
            <Text style={styles.publishBtnText}>Publish</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
              onPress={() => setCategory(cat.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.value && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title */}
        <Text style={styles.sectionLabel}>Title *</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's the discussion about? (min 10 characters)"
          placeholderTextColor={theme.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={TITLE_MAX}
          returnKeyType="next"
        />
        <Text style={[styles.charHint, title.length > TITLE_MAX * 0.9 && styles.charHintWarn]}>
          {title.length}/{TITLE_MAX}
        </Text>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description *</Text>
        <TextInput
          style={styles.descInput}
          placeholder="Share context, details, or your thoughts… (min 20 characters)"
          placeholderTextColor={theme.textTertiary}
          value={description}
          onChangeText={setDescription}
          maxLength={DESC_MAX}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.charHint, description.length > DESC_MAX * 0.9 && styles.charHintWarn]}>
          {description.length}/{DESC_MAX}
        </Text>

        {/* Anonymous toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="eye-off-outline" size={20} color={theme.anonymous} />
            <View>
              <Text style={styles.toggleLabel}>Post Anonymously</Text>
              <Text style={styles.toggleDesc}>
                Your identity is protected. Others see a consistent alias.
              </Text>
            </View>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: theme.borderStrong, true: `${theme.brandPrimary}55` }}
            thumbColor={isAnonymous ? theme.brandPrimary : theme.textTertiary}
          />
        </View>

        {/* Media attachment */}
        <Text style={styles.sectionLabel}>Media (optional)</Text>
        {mediaUri ? (
          <View style={styles.mediaPreviewWrap}>
            <Image
              source={{ uri: mediaUri }}
              style={styles.mediaPreview}
              contentFit="cover"
            />
            {uploadingMedia && (
              <View style={styles.mediaUploadingOverlay}>
                <ActivityIndicator color={theme.textOnPrimary} />
                <Text style={styles.mediaUploadingText}>Uploading…</Text>
              </View>
            )}
            {uploadedMediaUrl && !uploadingMedia && (
              <View style={styles.mediaReadyBadge}>
                <Ionicons name="checkmark-circle" size={16} color={theme.agree} />
                <Text style={styles.mediaReadyText}>Ready</Text>
              </View>
            )}
            <TouchableOpacity style={styles.mediaRemoveBtn} onPress={handleRemoveMedia}>
              <Ionicons name="close-circle" size={28} color={theme.disagree} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.mediaPickBtn} onPress={handlePickMedia} activeOpacity={0.75}>
            <Ionicons name="image-outline" size={22} color={theme.structure} />
            <Text style={styles.mediaPickBtnText}>Add Image or Video</Text>
          </TouchableOpacity>
        )}

        {/* Poll section */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="stats-chart-outline" size={20} color={theme.structure} />
            <View>
              <Text style={styles.toggleLabel}>Attach a Poll</Text>
              <Text style={styles.toggleDesc}>Let the community vote on options</Text>
            </View>
          </View>
          <Switch
            value={hasPoll}
            onValueChange={setHasPoll}
            trackColor={{ false: theme.borderStrong, true: `${theme.structure}55` }}
            thumbColor={hasPoll ? theme.structure : theme.textTertiary}
          />
        </View>

        {hasPoll && (
          <View style={styles.pollSection}>
            {/* Poll question */}
            <Text style={styles.sectionLabel}>Poll Question *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What should the community decide?"
              placeholderTextColor={theme.textTertiary}
              value={pollQuestion}
              onChangeText={setPollQuestion}
              maxLength={255}
            />

            {/* Poll options */}
            <Text style={styles.sectionLabel}>
              Options ({pollOptions.length}/{POLL_OPTIONS_MAX})
            </Text>
            {pollOptions.map((opt, idx) => (
              <View key={idx} style={styles.pollOptionRow}>
                <View style={styles.pollOptionNumber}>
                  <Text style={styles.pollOptionNumberText}>{idx + 1}</Text>
                </View>
                <TextInput
                  style={styles.pollOptionInput}
                  placeholder={`Option ${idx + 1}`}
                  placeholderTextColor={theme.textTertiary}
                  value={opt}
                  onChangeText={(v) => updatePollOption(idx, v)}
                  maxLength={100}
                />
                {pollOptions.length > POLL_OPTIONS_MIN && (
                  <TouchableOpacity
                    onPress={() => removePollOption(idx)}
                    hitSlop={8}
                    style={styles.pollOptionRemove}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color={theme.disagree} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {pollOptions.length < POLL_OPTIONS_MAX && (
              <TouchableOpacity style={styles.addOptionBtn} onPress={addPollOption}>
                <Ionicons name="add-circle-outline" size={18} color={theme.structure} />
                <Text style={styles.addOptionText}>Add Option</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.backgroundPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
    backgroundColor: theme.backgroundPrimary,
  },
  headerBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  publishBtn: {
    backgroundColor: theme.brandPrimary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: theme.textOnPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Section label
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  categoryChipActive: {
    borderColor: theme.brandPrimary,
    backgroundColor: theme.brandPrimaryLight,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.textSecondary,
  },
  categoryLabelActive: {
    color: theme.brandPrimaryDark,
    fontWeight: theme.fontWeight.semibold,
  },

  // Inputs
  titleInput: {
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: 12,
    padding: 14,
    fontSize: theme.fontSize.md,
    color: theme.textPrimary,
    backgroundColor: theme.backgroundPrimary,
  },
  descInput: {
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: 12,
    padding: 14,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: theme.backgroundPrimary,
  },
  charHint: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  charHintWarn: {
    color: theme.disagree,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
    marginBottom: 4,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
  },
  toggleDesc: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 2,
  },

  // Media
  mediaPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.borderStrong,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mediaPickBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.structure,
  },
  mediaPreviewWrap: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
  },
  mediaUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mediaUploadingText: {
    color: theme.textOnPrimary,
    fontSize: theme.fontSize.sm,
  },
  mediaReadyBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediaReadyText: {
    color: theme.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Poll
  pollSection: {
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
    paddingTop: 8,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pollOptionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollOptionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  pollOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: 10,
    padding: 10,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
  },
  pollOptionRemove: {
    padding: 2,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    alignSelf: 'flex-start',
  },
  addOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.structure,
    fontWeight: theme.fontWeight.medium,
  },

  bottomPadding: { height: 40 },
});
