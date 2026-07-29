package com.sithum.safevoice.entity;

import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.MediaType;
import com.sithum.safevoice.enums.TopicStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Main community discussion post, civic report, or polling thread.
 * Maps to table {@code topics} (Spec Section 4.2).
 */
@Entity
@Table(
        name = "topics",
        indexes = {
                @Index(name = "idx_topics_category_created", columnList = "category, created_at DESC"),
                @Index(name = "idx_topics_trending", columnList = "is_trending"),
                @Index(name = "idx_topics_author", columnList = "author_id")
        }
)
public class Topic {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** NULL if the author's account has been deleted (ON DELETE SET NULL). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", foreignKey = @ForeignKey(name = "fk_topics_author"))
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private Category category;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "author_is_anonymous", nullable = false)
    private Boolean authorIsAnonymous = false;

    @Column(name = "media_url", columnDefinition = "TEXT")
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 20)
    private MediaType mediaType;

    @Column(name = "views", nullable = false)
    private Integer views = 0;

    /** Managed by DB trigger trg_topic_reactions — do not mutate directly in app code. */
    @Column(name = "likes", nullable = false)
    private Integer likes = 0;

    /** Managed by DB trigger trg_topic_reactions — do not mutate directly in app code. */
    @Column(name = "dislikes", nullable = false)
    private Integer dislikes = 0;

    /** Managed by application/trigger logic when comments are added/removed. */
    @Column(name = "comment_count", nullable = false)
    private Integer commentCount = 0;

    @Column(name = "is_trending", nullable = false)
    private Boolean isTrending = false;

    @Column(name = "has_poll", nullable = false)
    private Boolean hasPoll = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TopicStatus status = TopicStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Topic() {
    }

    // ----- Getters & Setters -----

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getAuthorIsAnonymous() {
        return authorIsAnonymous;
    }

    public void setAuthorIsAnonymous(Boolean authorIsAnonymous) {
        this.authorIsAnonymous = authorIsAnonymous;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public MediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public Integer getDislikes() {
        return dislikes;
    }

    public void setDislikes(Integer dislikes) {
        this.dislikes = dislikes;
    }

    public Integer getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Boolean getIsTrending() {
        return isTrending;
    }

    public void setIsTrending(Boolean isTrending) {
        this.isTrending = isTrending;
    }

    public Boolean getHasPoll() {
        return hasPoll;
    }

    public void setHasPoll(Boolean hasPoll) {
        this.hasPoll = hasPoll;
    }

    public TopicStatus getStatus() {
        return status;
    }

    public void setStatus(TopicStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
