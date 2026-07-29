// src/screens/Home/EditTopicScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { topicsService, UpdateTopicPayload } from '../../services/topicsService';
import { uploadToCloudinary, validateMedia } from '../../utils/cloudinary';
import { theme } from '../../theme';

const TITLE_MAX = 255;
const DESC_MAX = 5000;

export default function EditTopicScreen({ navigation, route }: any) {
  const { topicId, title: initialTitle, description: initialDesc, mediaUrl: initialMediaUrl, mediaType: initialMediaType } = route.params;

  const [title, setTitle] = useState<string>(initialTitle ?? '');
  const [description, setDescription] = useState<string>(initialDesc ?? '');
  const [mediaUri, setMediaUri] = useState<string | null>(initialMediaUrl ?? null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | null>(initialMediaType ?? null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(initialMediaUrl ?? null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim().length >= 10 && description.trim().length >= 20;

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
    setMediaType(type.toUpperCase() as 'IMAGE' | 'VIDEO');
    setUploadedMediaUrl(null);
    setUploadingMedia(true);
    try {
      const url = await uploadToCloudinary(asset.uri, type);
      setUploadedMediaUrl(url);
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message ?? 'Could not upload media.');
    } finally {
      setUploadingMedia(false);
    }
  }, []);

  const handleRemoveMedia = () => {
    setMediaUri(null);
    setMediaType(null);
    setUploadedMediaUrl(null);
  };

  const handleSave = useCallback(async () => {
    if (!isValid || submitting) return;
    if (mediaUri && uploadingMedia) {
      Alert.alert('Please Wait', 'Media is still uploading.');
      return;
    }
    const payload: UpdateTopicPayload = {
      title: title.trim(),
      description: description.trim(),
      mediaUrl: uploadedMediaUrl ?? null,
      mediaType: mediaType ?? null,
    };
    setSubmitting(true);
    try {
      await topicsService.editTopic(topicId, payload);
      Alert.alert('Updated', 'Your topic has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, title, description, mediaUri, uploadingMedia, uploadedMediaUrl, mediaType, topicId, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Topic</Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!isValid || submitting) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.textOnPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          maxLength={TITLE_MAX}
          placeholder="Topic title"
          placeholderTextColor={theme.textTertiary}
        />
        <Text style={styles.charHint}>{title.length}/{TITLE_MAX}</Text>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.descInput]}
          value={description}
          onChangeText={setDescription}
          maxLength={DESC_MAX}
          multiline
          textAlignVertical="top"
          placeholder="Topic description"
          placeholderTextColor={theme.textTertiary}
        />
        <Text style={styles.charHint}>{description.length}/{DESC_MAX}</Text>

        <Text style={styles.label}>Media (optional)</Text>
        {mediaUri ? (
          <View style={styles.mediaWrap}>
            <Image source={{ uri: mediaUri }} style={styles.mediaPreview} contentFit="cover" />
            {uploadingMedia && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color={theme.textOnPrimary} />
              </View>
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveMedia}>
              <Ionicons name="close-circle" size={28} color={theme.disagree} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.pickBtn} onPress={handlePickMedia}>
            <Ionicons name="image-outline" size={20} color={theme.structure} />
            <Text style={styles.pickBtnText}>Change Media</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.backgroundPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  headerBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.textPrimary },
  saveBtn: { backgroundColor: theme.brandPrimary, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, minWidth: 70, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: theme.textOnPrimary, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold },
  content: { padding: 16 },
  label: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.textSecondary, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderColor: theme.borderDefault, borderRadius: 12, padding: 14, fontSize: theme.fontSize.sm, color: theme.textPrimary },
  descInput: { minHeight: 120, textAlignVertical: 'top' },
  charHint: { fontSize: 11, color: theme.textTertiary, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  mediaWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  mediaPreview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: theme.backgroundSecondary },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { position: 'absolute', top: 8, right: 8 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.borderStrong, borderRadius: 12, padding: 16, marginBottom: 16 },
  pickBtnText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium, color: theme.structure },
});
