// src/screens/TopicDetail/TopicDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { uploadToCloudinary } from "../../utils/cloudinary";
import NetInfo from "@react-native-community/netinfo";

import Avatar from "../../components/Avatar";
import Badge from "../../components/Badge";
import { theme } from "../../theme";
import { Comment, Poll, Topic } from "../../types/models";
import PollResultsBar from "../Polls/components/PollResultsBar";
import CommentInput from "./components/CommentInput";
import CommentThread from "./components/CommentThread";
import { topicsService } from "../../services/topicsService";
import { commentsService } from "../../services/commentsService";
import { reportsService } from "../../services/reportsService";

// ─── Constants ───────────────────────────────────────────────────────────────
const HEADER_SCROLL_DISTANCE = 90;

const REPORT_REASONS = [
  {
    id: "misinformation",
    label: "Misinformation",
    icon: "alert-circle-outline",
  },
  {
    id: "hate_speech",
    label: "Hate speech or harassment",
    icon: "hand-left-outline",
  },
  { id: "spam", label: "Spam or irrelevant", icon: "mail-unread-outline" },
  { id: "violence", label: "Violence or threats", icon: "warning-outline" },
  { id: "privacy", label: "Privacy violation", icon: "eye-off-outline" },
  {
    id: "other",
    label: "Other",
    icon: "ellipsis-horizontal-circle-outline",
  },
] as const;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Reply tree helpers ───────────────────────────────────────────────────────
function insertReplyInTree(
  list: Comment[],
  parentId: string,
  reply: Comment,
): Comment[] {
  return list.map((c) => {
    if (c.id === parentId)
      return { ...c, replies: [...(c.replies ?? []), reply] };
    if (c.replies?.length)
      return { ...c, replies: insertReplyInTree(c.replies, parentId, reply) };
    return c;
  });
}

function replaceInTree(
  list: Comment[],
  tempId: string,
  parentId: string | null,
  real: Comment,
): Comment[] {
  if (!parentId) return list.map((c) => (c.id === tempId ? real : c));
  return list.map((c) => {
    if (c.id === parentId) {
      return {
        ...c,
        replies: (c.replies ?? []).map((r) => (r.id === tempId ? real : r)),
      };
    }
    if (c.replies?.length)
      return {
        ...c,
        replies: replaceInTree(c.replies, tempId, parentId, real),
      };
    return c;
  });
}

function removeFromTree(
  list: Comment[],
  tempId: string,
  parentId: string | null,
): Comment[] {
  if (!parentId) return list.filter((c) => c.id !== tempId);
  return list.map((c) => {
    if (c.id === parentId) {
      return {
        ...c,
        replies: (c.replies ?? []).filter((r) => r.id !== tempId),
      };
    }
    if (c.replies?.length)
      return { ...c, replies: removeFromTree(c.replies, tempId, parentId) };
    return c;
  });
}

// ─── ReportSheet ──────────────────────────────────────────────────────────────
interface ReportSheetProps {
  visible: boolean;
  target: "topic" | "comment";
  onClose: () => void;
  onSubmit: (reasonId: string) => void;
}

function ReportSheet({ visible, target, onClose, onSubmit }: ReportSheetProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (!selected) return;
    onSubmit(selected);
    setSelected(null);
  }, [selected, onSubmit]);

  const handleClose = useCallback(() => {
    setSelected(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <View style={styles.sheetIconCircle}>
                <Ionicons name="flag" size={16} color={theme.disagreeText} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Report {target}</Text>
                <Text style={styles.sheetSubtitle}>
                  Help us keep SafeVoice safe
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.reasonList}>
            {REPORT_REASONS.map((reason, i) => {
              const isSelected = selected === reason.id;
              const isLast = i === REPORT_REASONS.length - 1;
              return (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonRow,
                    isSelected && styles.reasonRowSelected,
                    !isLast && styles.reasonRowBorder,
                  ]}
                  onPress={() => setSelected(reason.id)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.reasonIconWrap,
                      isSelected && styles.reasonIconWrapSelected,
                    ]}
                  >
                    <Ionicons
                      name={reason.icon as any}
                      size={16}
                      color={
                        isSelected ? theme.disagreeText : theme.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.reasonLabel,
                      isSelected && styles.reasonLabelSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sheetNotice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={theme.colors.teal600}
            />
            <Text style={styles.sheetNoticeText}>
              Reports are reviewed by moderators and kept confidential.
            </Text>
          </View>

          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !selected && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selected}
            >
              <Ionicons
                name="flag"
                size={15}
                color={selected ? theme.colors.white : theme.textTertiary}
              />
              <Text
                style={[
                  styles.submitButtonText,
                  !selected && styles.submitButtonTextDisabled,
                ]}
              >
                Submit report
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── ListHeader ───────────────────────────────────────────────────────────────
interface ListHeaderProps {
  topic: Topic;
  poll: Poll | null;
  liked: boolean;
  disliked: boolean;
  saved: boolean;
  heroParallax: Animated.AnimatedInterpolation<number>;
  onToggleLike: () => void;
  onToggleDislike: () => void;
  onToggleSave: () => void;
  onReport: () => void;
  commentCount: number;
  commentsEmpty: boolean;
  displayedLikes: number;
  displayedDislikes: number;
}

const ListHeader = ({
  topic,
  poll,
  liked,
  disliked,
  saved,
  heroParallax,
  onToggleLike,
  onToggleDislike,
  onToggleSave,
  onReport,
  commentCount,
  commentsEmpty,
  displayedLikes,
  displayedDislikes,
}: ListHeaderProps) => (
  <>
    {/* ── Hero block ── */}
    <Animated.View
      style={[styles.hero, { transform: [{ translateY: heroParallax }] }]}
    >
      {topic.isTrending && <View style={styles.trendingAccent} />}

      {/* Badges row */}
      <View style={styles.badgeRow}>
        <Badge label={topic.category} variant="category" />
        {topic.isTrending && (
          <Badge label="Trending" variant="trending" icon="flame" />
        )}
        {topic.hasPoll && (
          <Badge label="Poll" variant="neutral" icon="stats-chart" />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{topic.title}</Text>

      {/* Author card */}
      <View style={styles.authorCard}>
        <Avatar
          initials={
            topic.authorIsAnonymous
              ? "?"
              : topic.authorNickname.slice(0, 2).toUpperCase()
          }
          isAnonymous={topic.authorIsAnonymous}
          size={38}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {topic.authorIsAnonymous ? "Anonymous" : topic.authorNickname}
          </Text>
          <View style={styles.authorMetaRow}>
            <Ionicons
              name="time-outline"
              size={11}
              color={theme.textTertiary}
            />
            <Text style={styles.metaText}>{timeAgo(topic.createdAt)}</Text>
            <View style={styles.metaDot} />
            <Ionicons name="eye-outline" size={11} color={theme.textTertiary} />
            <Text style={styles.metaText}>
              {formatCount(topic.views)} views
            </Text>
          </View>
        </View>
        {topic.authorIsAnonymous && (
          <View style={styles.anonShield}>
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={theme.colors.teal600}
            />
            <Text style={styles.anonShieldText}>protected</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>{topic.description}</Text>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrap}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={theme.textSecondary}
            />
          </View>
          <Text style={styles.statValue}>{formatCount(commentCount)}</Text>
          <Text style={styles.statLabel}>comments</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, styles.statIconWrapAgree]}>
            <Ionicons name="thumbs-up" size={15} color={theme.agreeText} />
          </View>
          <Text style={[styles.statValue, { color: theme.agreeText }]}>
            {formatCount(displayedLikes)}
          </Text>
          <Text style={styles.statLabel}>agree</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, styles.statIconWrapDisagree]}>
            <Ionicons name="thumbs-down" size={15} color={theme.disagreeText} />
          </View>
          <Text style={[styles.statValue, { color: theme.disagreeText }]}>
            {formatCount(displayedDislikes)}
          </Text>
          <Text style={styles.statLabel}>disagree</Text>
        </View>
      </View>

      {/* Reaction bar */}
      <View style={styles.reactionBar}>
        <TouchableOpacity
          style={[styles.reactionButton, liked && styles.reactionButtonLiked]}
          onPress={onToggleLike}
          activeOpacity={0.78}
        >
          <Ionicons
            name={liked ? "thumbs-up" : "thumbs-up-outline"}
            size={16}
            color={liked ? theme.agreeText : theme.textSecondary}
          />
          <Text
            style={[styles.reactionLabel, liked && { color: theme.agreeText }]}
          >
            Agree
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reactionButton,
            disliked && styles.reactionButtonDisliked,
          ]}
          onPress={onToggleDislike}
          activeOpacity={0.78}
        >
          <Ionicons
            name={disliked ? "thumbs-down" : "thumbs-down-outline"}
            size={16}
            color={disliked ? theme.disagreeText : theme.textSecondary}
          />
          <Text
            style={[
              styles.reactionLabel,
              disliked && { color: theme.disagreeText },
            ]}
          >
            Disagree
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.78}>
          <Ionicons
            name="share-social-outline"
            size={16}
            color={theme.colors.teal600}
          />
          <Text style={styles.shareLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>

    {/* ── Poll ── */}
    {poll && (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLabelRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons
                name="stats-chart"
                size={13}
                color={theme.colors.teal600}
              />
            </View>
            <Text style={styles.sectionLabel}>Community poll</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <PollResultsBar poll={poll} />
      </View>
    )}

    {/* ── Comments header ── */}
    <View style={styles.commentsHeaderSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLabelRow}>
          <View style={styles.sectionIconWrap}>
            <Ionicons
              name="chatbubbles"
              size={13}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.sectionLabel}>
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </Text>
        </View>
        <TouchableOpacity style={styles.sortHint}>
          <Ionicons
            name="swap-vertical-outline"
            size={13}
            color={theme.textTertiary}
          />
          <Text style={styles.sortHintText}>Top</Text>
        </TouchableOpacity>
      </View>

      {commentsEmpty && (
        <View style={styles.emptyComments}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={30}
                color={theme.colors.teal600}
              />
            </View>
          </View>
          <Text style={styles.emptyCommentsTitle}>No comments yet</Text>
          <Text style={styles.emptyCommentsBody}>
            Be the first to join this discussion
          </Text>
        </View>
      )}
    </View>
  </>
);

// ─── Item separator ───────────────────────────────────────────────────────────
const ItemSeparator = () => <View style={styles.commentDivider} />;

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function TopicDetailScreen({ route, navigation }: any) {
  const { topicId } = route.params || {};

  const [topic, setTopic] = useState<Topic | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [reportSheet, setReportSheet] = useState<{
    visible: boolean;
    target: "topic" | "comment";
    comment?: Comment;
  }>({ visible: false, target: "topic" });

  // ── Scroll animation ──────────────────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  const stickyTitleOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
    [scrollY],
  );

  const heroParallax = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -12],
        extrapolate: "clamp",
      }),
    [scrollY],
  );

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const fetchedTopic = await topicsService.getTopicDetail(topicId);
        if (cancelled) return;

        const formattedTopic: Topic = {
          ...fetchedTopic,
          mediaUrl: fetchedTopic.mediaUrl || undefined,
          authorIsAnonymous: fetchedTopic.isAnonymous,
          isSaved: fetchedTopic.isSavedByMe,
          userReaction:
            fetchedTopic.myReaction === "LIKE"
              ? "like"
              : fetchedTopic.myReaction === "DISLIKE"
              ? "dislike"
              : null,
        };

        setTopic(formattedTopic);
        setSaved(!!fetchedTopic.isSavedByMe);
        setLiked(fetchedTopic.myReaction === "LIKE");
        setDisliked(fetchedTopic.myReaction === "DISLIKE");

        if (fetchedTopic.poll) {
          const formattedPoll: Poll = {
            id: fetchedTopic.poll.id,
            topicId: topicId,
            question: fetchedTopic.poll.question,
            options: fetchedTopic.poll.options.map((o) => ({
              id: o.id,
              label: o.label,
              votes: o.votes,
            })),
            totalVotes: fetchedTopic.poll.totalVotes,
            closesAt: fetchedTopic.poll.closesAt || "",
            userHasVoted: (fetchedTopic.poll.userVotedOptionIds?.length ?? 0) > 0,
            userVotedOptionId: fetchedTopic.poll.userVotedOptionIds?.[0],
            createdAt: fetchedTopic.createdAt,
          };
          setPoll(formattedPoll);
        }

        const fetchedComments = await commentsService.getTopicComments(topicId);
        if (cancelled) return;

        const formatComment = (c: any): Comment => ({
          id: c.id,
          topicId: c.topicId,
          parentCommentId: c.parentCommentId,
          authorNickname: c.authorNickname,
          isAnonymous: c.isAnonymous,
          anonymousId: c.anonymousId,
          body: c.body,
          mediaUrl: c.mediaUrl,
          mediaType: c.mediaType === "VIDEO" ? "video" : c.mediaType === "IMAGE" ? "image" : null,
          createdAt: c.createdAt,
          likes: c.likes,
          dislikes: c.dislikes,
          depth: c.depth,
          replies: (c.replies || []).map(formatComment),
          userReaction: c.myReaction === "LIKE" ? "like" : c.myReaction === "DISLIKE" ? "dislike" : null,
        });

        setComments(fetchedComments.map(formatComment));
      } catch (err) {
        // Handle error gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  // ── Stable callbacks ──────────────────────────────────────────────────────
  const handleToggleLike = useCallback(async () => {
    if (!topic) return;
    setLiked((wasLiked) => {
      const next = !wasLiked;
      setDisliked(false);
      setTopic((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: next ? prev.likes + 1 : Math.max(0, prev.likes - 1),
          dislikes: prev.userReaction === "dislike" ? Math.max(0, prev.dislikes - 1) : prev.dislikes,
          userReaction: next ? "like" : null,
        };
      });
      return next;
    });
    try {
      await topicsService.toggleReaction(topic.id, "LIKE");
    } catch (e) {
      // Ignore or revert state on error
    }
  }, [topic]);

  const handleToggleDislike = useCallback(async () => {
    if (!topic) return;
    setDisliked((wasDisliked) => {
      const next = !wasDisliked;
      setLiked(false);
      setTopic((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dislikes: next ? prev.dislikes + 1 : Math.max(0, prev.dislikes - 1),
          likes: prev.userReaction === "like" ? Math.max(0, prev.likes - 1) : prev.likes,
          userReaction: next ? "dislike" : null,
        };
      });
      return next;
    });
    try {
      await topicsService.toggleReaction(topic.id, "DISLIKE");
    } catch (e) {
      // Ignore or revert state on error
    }
  }, [topic]);

  const handleToggleSave = useCallback(async () => {
    if (!topic) return;
    setSaved((prev) => !prev);
    try {
      await topicsService.toggleSaveTopic(topic.id);
    } catch (e) {
      // Ignore or revert state
    }
  }, [topic]);

  const handleReportTopic = useCallback(() => {
    setReportSheet({ visible: true, target: "topic" });
  }, []);

  const handleReportComment = useCallback((comment: Comment) => {
    setReportSheet({ visible: true, target: "comment", comment });
  }, []);

  const handleCloseReport = useCallback(() => {
    setReportSheet((s) => ({ ...s, visible: false }));
  }, []);

  const handleReportSubmit = useCallback(
    async (reasonId: string) => {
      const reason = REPORT_REASONS.find((r) => r.id === reasonId);
      if (!reason || !topic) return;

      const targetType = reportSheet.target === "comment" ? "COMMENT" : "TOPIC";
      const targetCommentId = reportSheet.comment?.id || null;
      const targetTopicId = targetType === "TOPIC" ? topic.id : null;

      const reasonEnumMap: Record<string, "SPAM" | "HARASSMENT" | "MISINFORMATION" | "HATE_SPEECH" | "OTHER"> = {
        misinformation: "MISINFORMATION",
        hate_speech: "HATE_SPEECH",
        spam: "SPAM",
        violence: "HARASSMENT",
        privacy: "OTHER",
        other: "OTHER",
      };

      try {
        await reportsService.submitReport({
          targetType,
          targetTopicId,
          targetCommentId,
          reason: reasonEnumMap[reasonId] || "OTHER",
          details: `Reported via mobile app: ${reason.label}`,
        });

        setReportSheet({ visible: false, target: "topic" });
        Alert.alert(
          "Report submitted",
          "Thanks for flagging this. Our moderators will review it shortly."
        );
      } catch (err: any) {
        Alert.alert("Report Error", err.message || "Could not submit report.");
      }
    },
    [topic, reportSheet]
  );

  const handleCancelReply = useCallback(() => setReplyingTo(null), []);
  const handleSetReply = useCallback((c: Comment) => setReplyingTo(c), []);

  const handleSubmitComment = useCallback(
    async (
      text: string,
      isAnonymous: boolean,
      media?: { uri: string; type: "image" | "video" }
    ) => {
      if (!topic) return;

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert("Offline", "You cannot post a comment while offline.");
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const depth = replyingTo ? replyingTo.depth + 1 : 0;
      const parentId = replyingTo?.id ?? null;

      const tempComment: Comment = {
        id: tempId,
        topicId: topic.id,
        parentCommentId: parentId,
        authorNickname: isAnonymous ? "Anonymous" : "You",
        isAnonymous,
        anonymousId: isAnonymous ? "anon_123" : undefined,
        body: text,
        mediaUrl: media?.uri,
        mediaType: media?.type,
        isUploading: !!media,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        depth,
        replies: [],
      };

      setComments((prev) =>
        parentId
          ? insertReplyInTree(prev, parentId, tempComment)
          : [...prev, tempComment]
      );

      const currentParentId = parentId;
      setReplyingTo(null);

      try {
        let uploadedUrl: string | null = null;
        if (media) {
          uploadedUrl = await uploadToCloudinary(media.uri, media.type);
        }

        const postedDTO = await commentsService.postComment(topic.id, {
          parentCommentId: currentParentId,
          body: text,
          isAnonymous,
          mediaUrl: uploadedUrl,
          mediaType: media?.type === "video" ? "VIDEO" : media?.type === "image" ? "IMAGE" : null,
        });

        const newComment: Comment = {
          id: postedDTO.id,
          topicId: postedDTO.topicId,
          parentCommentId: postedDTO.parentCommentId,
          authorNickname: postedDTO.authorNickname,
          isAnonymous: postedDTO.isAnonymous,
          anonymousId: postedDTO.anonymousId || undefined,
          body: postedDTO.body,
          mediaUrl: postedDTO.mediaUrl,
          mediaType: postedDTO.mediaType === "VIDEO" ? "video" : postedDTO.mediaType === "IMAGE" ? "image" : null,
          isUploading: false,
          createdAt: postedDTO.createdAt,
          likes: postedDTO.likes,
          dislikes: postedDTO.dislikes,
          depth: postedDTO.depth,
          replies: [],
        };

        setComments((prev) =>
          replaceInTree(prev, tempId, currentParentId, newComment)
        );
        setTopic((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
      } catch (e: any) {
        Alert.alert("Error", e.message || "Could not post comment");
        setComments((prev) => removeFromTree(prev, tempId, currentParentId));
      }
    },
    [topic, replyingTo]
  );

  const handleCommentReaction = useCallback(
    async (commentId: string, reactionType: "LIKE" | "DISLIKE") => {
      try {
        const updatedDTO = await commentsService.toggleCommentReaction(
          commentId,
          reactionType
        );

        setComments((prev) => {
          const updateInTree = (nodes: Comment[]): Comment[] => {
            return nodes.map((node) => {
              if (node.id === commentId) {
                return {
                  ...node,
                  likes: updatedDTO.likes,
                  dislikes: updatedDTO.dislikes,
                  userReaction:
                    updatedDTO.myReaction === "LIKE"
                      ? "like"
                      : updatedDTO.myReaction === "DISLIKE"
                      ? "dislike"
                      : null,
                };
              }
              if (node.replies && node.replies.length > 0) {
                return { ...node, replies: updateInTree(node.replies) };
              }
              return node;
            });
          };
          return updateInTree(prev);
        });
      } catch (e: any) {
        Alert.alert("Reaction Error", e.message || "Failed to submit comment reaction.");
      }
    },
    []
  );

  // ── FIX: plain callback instead of Animated.event ────────────────────────
  // FlashList is not an Animated-aware component, so Animated.event passed
  // to onScroll fires "undefined is not a function" on every scroll frame.
  // Using setValue on a plain callback keeps animations working correctly.
  const onScroll = useCallback(
    (e: any) => {
      scrollY.setValue(e.nativeEvent.contentOffset.y);
    },
    [scrollY],
  );

  // ── FlashList renderItem ──────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: { item: Comment; index: number }) => (
      <View style={styles.commentWrapper}>
        <CommentThread
          comment={item}
          onReply={handleSetReply}
          onReaction={handleCommentReaction}
          onReport={handleReportComment}
        />
      </View>
    ),
    [handleSetReply, handleCommentReaction, handleReportComment],
  );

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const getItemType = useCallback((item: Comment) => {
    if (item.mediaType === "video") return "video";
    if (item.mediaType === "image") return "image";
    return "text";
  }, []);

  // ── Stable ListHeader ─────────────────────────────────────────────────────
  const listHeader = useMemo(() => {
    if (!topic) return null;
    return (
      <ListHeader
        topic={topic}
        poll={poll}
        liked={liked}
        disliked={disliked}
        saved={saved}
        heroParallax={heroParallax}
        onToggleLike={handleToggleLike}
        onToggleDislike={handleToggleDislike}
        onToggleSave={handleToggleSave}
        onReport={handleReportTopic}
        commentCount={topic.commentCount}
        commentsEmpty={comments.length === 0}
        displayedLikes={topic.likes}
        displayedDislikes={topic.dislikes}
      />
    );
  }, [
    topic,
    poll,
    liked,
    disliked,
    saved,
    heroParallax,
    handleToggleLike,
    handleToggleDislike,
    handleToggleSave,
    handleReportTopic,
    comments.length,
  ]);

  const replyingToLabel = useMemo(() => {
    if (!replyingTo) return null;
    return replyingTo.isAnonymous
      ? `Anonymous · ${replyingTo.anonymousId?.slice(-4)}`
      : replyingTo.authorNickname;
  }, [replyingTo]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
          <Text style={styles.loadingText}>Loading discussion…</Text>
        </View>
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingCard}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={theme.textTertiary}
          />
          <Text style={styles.notFoundText}>Topic not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* ── Sticky top bar ── */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={[theme.colors.teal800, theme.colors.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        <Animated.Text
          style={[styles.stickyTitle, { opacity: stickyTitleOpacity }]}
          numberOfLines={1}
        >
          {topic.title}
        </Animated.Text>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={handleToggleSave}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? theme.colors.amber200 : theme.colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={handleReportTopic}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name="flag-outline"
              size={18}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── FlashList ── */}
      <FlashList
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        data={comments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemType={getItemType}
        {...({ estimatedItemSize: 130 } as any)}
        drawDistance={800}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews
      />

      <CommentInput
        replyingTo={replyingToLabel}
        onCancelReply={handleCancelReply}
        onSubmit={handleSubmitComment}
      />

      <ReportSheet
        visible={reportSheet.visible}
        target={reportSheet.target}
        onClose={handleCloseReport}
        onSubmit={handleReportSubmit}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.backgroundSecondary },
  centered: { justifyContent: "center", alignItems: "center" },

  // Loading / not-found
  loadingCard: {
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  notFoundText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
  },
  goBackButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.teal600,
  },
  goBackText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    paddingHorizontal: theme.spacing.md,
    overflow: "hidden",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  stickyTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
    marginRight: theme.spacing.sm,
  },
  topBarActions: { flexDirection: "row", gap: 8 },
  topBarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: theme.backgroundPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
    overflow: "hidden",
  },
  trendingAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.amber200,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  // Badges
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },

  // Title
  title: {
    fontSize: 22,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
    lineHeight: 31,
    letterSpacing: -0.5,
    marginBottom: 16,
  },

  // Author card
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: 12,
    marginBottom: 16,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    marginBottom: 3,
  },
  authorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  metaText: { fontSize: 11, color: theme.textTertiary },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.borderDefault,
    marginHorizontal: 2,
  },
  anonShield: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.teal50,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  anonShieldText: {
    fontSize: 10,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.semibold,
  },

  // Description
  description: {
    fontSize: theme.fontSize.base,
    color: theme.textPrimary,
    lineHeight: 26,
    marginBottom: 18,
  },

  // Stats strip
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    paddingVertical: 12,
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.backgroundPrimary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  statIconWrapAgree: {
    backgroundColor: theme.agreeLight,
    borderColor: theme.colors.green100,
  },
  statIconWrapDisagree: {
    backgroundColor: theme.disagreeLight,
    borderColor: theme.colors.red100,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textTertiary,
    fontWeight: theme.fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 36, backgroundColor: theme.borderDefault },

  // Reaction bar
  reactionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  reactionButtonLiked: {
    backgroundColor: theme.agreeLight,
    borderColor: theme.colors.green100,
  },
  reactionButtonDisliked: {
    backgroundColor: theme.disagreeLight,
    borderColor: theme.colors.red100,
  },
  reactionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textSecondary,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    backgroundColor: theme.colors.teal50,
  },
  shareLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.teal600,
  },

  // Section (poll)
  section: {
    backgroundColor: theme.backgroundPrimary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.borderDefault,
  },

  // Comments header section
  commentsHeaderSection: {
    backgroundColor: theme.backgroundPrimary,
    marginBottom: 2,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderTopWidth: 1,
    borderColor: theme.borderDefault,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.teal600,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.disagree,
  },
  liveText: {
    fontSize: 10,
    color: theme.disagree,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sortHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  sortHintText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },

  // Comments
  commentWrapper: {
    backgroundColor: theme.backgroundPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  commentDivider: {
    height: 1,
    backgroundColor: theme.borderDefault,
  },

  // Empty state
  emptyComments: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 10,
  },
  emptyIconOuter: {
    padding: 6,
    borderRadius: 28,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    marginBottom: 4,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.teal50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCommentsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  emptyCommentsBody: {
    fontSize: theme.fontSize.sm,
    color: theme.textTertiary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Report sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.backgroundPrimary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.borderDefault,
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  sheetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(239,68,68,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.18)",
  },
  sheetTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
    textTransform: "capitalize",
  },
  sheetSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
    marginTop: 2,
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  reasonList: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    overflow: "hidden",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  reasonRowSelected: { backgroundColor: "rgba(239,68,68,0.04)" },
  reasonRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  reasonIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  reasonIconWrapSelected: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.2)",
  },
  reasonLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    fontWeight: "500",
  },
  reasonLabelSelected: { color: theme.disagreeText, fontWeight: "600" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: theme.disagreeText },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.disagreeText,
  },
  sheetNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.teal50,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    padding: 10,
  },
  sheetNoticeText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.teal600,
    lineHeight: 16,
    fontWeight: "500",
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.disagreeText,
  },
  submitButtonDisabled: {
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  submitButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.white,
  },
  submitButtonTextDisabled: { color: theme.textTertiary },
});
