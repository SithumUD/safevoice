# SafeVoice — System Architecture & Complete Backend Technical Specification

## 1. Executive Summary & Project Overview

**SafeVoice** is a secure, privacy-focused community discussion, social polling, and civic reporting platform. It consists of a **React Native (Expo)** mobile application for end users and a **Next.js 14** web admin panel for platform administrators and content moderators, backed by an enterprise **Java 21 Spring Boot 3** REST & WebSocket backend with a **PostgreSQL 15+** database.

The platform facilitates open, anonymous, and public dialogue on civic issues, community safety, public policies, and community polls while protecting user privacy through thread-scoped anonymous identifiers and ensuring content safety via a moderation and reporting workflow. All media assets (images, avatar photos, video attachments) are securely managed and served globally via **Cloudinary**.

---

## 2. Complete Technology Stack & Architecture

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|  +---------------------------------+  +----------------------------+  |
|  |   Mobile App (React Native/Expo)|  | Admin Web (Next.js 14 App) |  |
|  +---------------------------------+  +----------------------------+  |
+-----------------------------------:-----------------------------------+
                                    | HTTP REST (JSON) / WebSocket (STOMP)
+-----------------------------------v-----------------------------------+
|                           BACKEND LAYER                               |
|  +-----------------------------------------------------------------+  |
|  |             Java 21 LTS + Spring Boot 3.3+ / 4.1.0               |  |
|  |  [ Spring Security ]  [ Spring Data JPA ]  [ Spring WebSocket ]  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------:-----------------------------------+
                                    | SQL (HikariCP) / Redis Commands
+-----------------------------------v-----------------------------------+
|                          DATA & CLOUD LAYER                           |
|  +---------------------------+  +----------------------------------+  |
|  |   PostgreSQL 15 Database   |  |   Redis Cache & Session Store    |  |
|  +---------------------------+  +----------------------------------+  |
|  +---------------------------+  +----------------------------------+  |
|  |  Cloudinary Media Cloud   |  | Firebase Cloud Messaging (FCM)    |  |
|  +---------------------------+  +----------------------------------+  |
|  +-----------------------------------------------------------------+  |
|  |       AWS ECS / EC2 | Docker Containers | GitHub Actions CI/CD     |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### 2.1 Technology Matrix

| Layer | Technology | Version | Key Usage |
|---|---|---|---|
| **Language** | Java | 21 LTS | Core backend runtime utilizing Virtual Threads (Project Loom) |
| **Framework** | Spring Boot | 3.3.x / 4.1.0 | Enterprise Web API, Security, JPA, WebSocket |
| **Database** | PostgreSQL | 15+ | Relational persistence, JSONB data, triggers & stored functions |
| **Caching / PubSub**| Redis | 7.0+ | Rate limiting, session token invalidation, fast vote caching |
| **Media Storage** | Cloudinary | Java SDK v1.38+ | Storing, transforming, and CDN delivery of images & videos |
| **Security** | Spring Security + JJWT | 0.12.5 | Stateless JWT authentication, RBAC authorization filters |
| **WebSocket** | Spring Messaging + STOMP | SockJS | Real-time live poll vote pushes and notification broadcasts |
| **Mobile App** | React Native (Expo) | v56.0.0+ | Mobile client app for iOS & Android |
| **Admin Panel** | Next.js | 14 App Router | Admin & Moderator web management platform |

---

### 2.2 Backend Cloudinary Configuration (`application.yml`)

```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:safevoice-app}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
  upload-preset: ${CLOUDINARY_UPLOAD_PRESET:safevoice_signed_preset}
```

#### Required Cloudinary Maven Dependency:
```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.38.0</version>
</dependency>
```

---

## 3. User Roles & Role-Based Access Control (RBAC) Matrix

### 3.1 Role Definitions

1. **`GUEST` (Unauthenticated Visitor)**
   - Read-only access to public topics, comments, categories, and poll options.
   - Cannot create content, vote, react, save posts, or submit content flags.

2. **`USER` (Authenticated Community Member)**
   - Can create discussion topics and optional embedded community polls.
   - Can comment on topics, post nested replies, and toggle **Anonymous Posting**.
   - Can upload media attachments (avatars, topic images/videos) via Cloudinary.
   - Can vote on polls (enforced single-vote per poll), react (like/dislike) to topics/comments, and bookmark topics.
   - Can flag/report inappropriate content to moderation.
   - Can edit or delete their own posts/comments.

3. **`MODERATOR` (Community Safety Officer)**
   - All `USER` permissions.
   - Access to the Moderation Reporting Queue (`GET /api/v1/admin/reports`).
   - Can review content reports, approve/dismiss flags, soft-delete or hide offending content.
   - Can lock topic discussions to prevent further comments.
   - Can issue temporary user suspensions (e.g., 24h, 7d, 30d).

4. **`ADMIN` (Platform Administrator)**
   - All `MODERATOR` permissions.
   - Access to platform-wide telemetry, metrics, and user management (`GET /api/v1/admin/users`).
   - Can grant/revoke `MODERATOR` roles and issue permanent user bans.
   - Can create official Civic Announcements and system-wide sticky polls.
   - Can broadcast global notifications to all active mobile users.

5. **`SYSTEM` (Internal System Process)**
   - Automated system trigger actor for scheduled jobs, trending score recalibration, and automated notification dispatch.

---

### 3.2 Granular Permissions Matrix

| Permission / Action | Guest | User | Moderator | Admin | System |
|---|:---:|:---:|:---:|:---:|:---:|
| `VIEW_PUBLIC_FEEDS` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `VIEW_TOPIC_DETAILS` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `VIEW_POLL_RESULTS` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `CREATE_TOPIC` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `POST_COMMENT` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `POST_ANONYMOUSLY` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `UPLOAD_MEDIA_CLOUDINARY`| ❌ | ✅ | ✅ | ✅ | ❌ |
| `VOTE_POLL` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `REACT_TOPIC_COMMENT` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `SAVE_TOPIC` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `SUBMIT_REPORT` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `EDIT_OWN_CONTENT` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `DELETE_OWN_CONTENT` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `VIEW_MODERATION_QUEUE` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `RESOLVE_REPORTS` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `DELETE_ANY_CONTENT` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `LOCK_TOPIC` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `SUSPEND_USER` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `BAN_USER_PERMANENT` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `MANAGE_USER_ROLES` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `VIEW_SYSTEM_METRICS` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `BROADCAST_GLOBAL_NOTIF`| ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 3.3 Anonymity Architecture & Privacy Isolation

SafeVoice enforces strict privacy protection for anonymous content:

```
[ User: Sithu (ID: u_102) ]
          │
          ├── Toggle: author_is_anonymous = true
          │
          ▼
[ Backend Generation Service ]
   Computes thread-scoped alias: SHA-256("u_102" + "topic_55" + secret) -> "Anon #402"
          │
          ▼
[ Public API Payload Response ]
   {
     "id": "c_801",
     "authorNickname": "Anon #402",
     "isAnonymous": true,
     "authorId": null  <-- Hidden in API Response for non-admins!
   }
```

* **Thread-Scoped Aliases (`anonymous_id`):** When a user posts anonymously in a topic, a thread-consistent alias (e.g. `Anon #402`) is generated. The same user commenting multiple times inside Topic A will always display `Anon #402` in Topic A, but will receive a different identifier (e.g. `Anon #119`) in Topic B.
* **API Response Masking:** For anonymous posts/comments, the backend DTO serializer explicitly sets `author_id = null` and replaces `author_nickname` with the generated `anonymous_id` in public JSON payloads.
* **Audit & Legal Compliance:** The actual `author_id` is stored in the database for safety and legal compliance. Only Super Admins with explicit audit logging can reveal author identity during legal subpoena or severe safety investigations.

---

## 4. Complete Database Entity Specifications & Data Dictionary

The PostgreSQL database consists of **15 entities and junction tables**. Below is the complete data dictionary with every field, SQL data type, constraint, JPA mapping, and business rule.

---

### 4.1 `users` Entity

Stores registered platform user profiles and aggregated engagement metrics.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique user identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | `String` | User email address for authentication. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | `String` | BCrypt encrypted password hash. |
| `nickname` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | `String` | Public display name / handle. |
| `avatar_url` | `TEXT` | `NULL` | `String` | URL pointing to user profile picture on Cloudinary CDN. |
| `role` | `VARCHAR(20)` | `NOT NULL`, Default `'USER'` | `UserRole` Enum | Enum: `USER`, `MODERATOR`, `ADMIN`. |
| `status` | `VARCHAR(20)` | `NOT NULL`, Default `'ACTIVE'` | `UserStatus` Enum | Enum: `ACTIVE`, `SUSPENDED`, `BANNED`. |
| `comments_count` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total comments posted by this user. |
| `likes_received` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total upvotes received across topics/comments. |
| `poll_votes_count`| `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total poll votes cast by this user. |
| `member_since` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Account creation timestamp. |
| `last_login_at` | `TIMESTAMPTZ` | `NULL` | `Instant` | Timestamp of last successful login. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Record modification timestamp. |

* **Indexes:** `idx_users_email` (BTREE), `idx_users_nickname` (BTREE).

---

### 4.2 `topics` Entity

Stores main community discussion posts, civic reports, and polling threads.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique topic identifier. |
| `author_id` | `UUID` | `FK -> users(id) ON DELETE SET NULL` | `UUID` | Author user ID. `NULL` if account deleted. |
| `category` | `VARCHAR(50)` | `NOT NULL` | `Category` Enum | Enum: `CIVIC`, `SAFETY`, `EDUCATION`, `COMMUNITY`, `GENERAL`, `POLLS`. |
| `title` | `VARCHAR(255)`| `NOT NULL` | `String` | Post title (10 to 255 chars). |
| `description` | `TEXT` | `NOT NULL` | `String` | Main post body content. |
| `author_is_anonymous`|`BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Flag indicating if author posted anonymously. |
| `media_url` | `TEXT` | `NULL` | `String` | Cloudinary CDN URL for attached image/video. |
| `media_type` | `VARCHAR(20)` | `NULL` | `MediaType` Enum| Enum: `IMAGE`, `VIDEO`. |
| `views` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total view count. Incremented via API. |
| `likes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total upvotes count. Managed by triggers. |
| `dislikes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total downvotes count. Managed by triggers. |
| `comment_count` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total replies count. Managed by triggers. |
| `is_trending` | `BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Flag computed by background analytics job. |
| `has_poll` | `BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Indicates if an interactive poll is attached. |
| `status` | `VARCHAR(20)` | `NOT NULL`, Default `'ACTIVE'` | `TopicStatus` Enum| Enum: `ACTIVE`, `LOCKED`, `HIDDEN`, `DELETED`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Topic creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Topic update timestamp. |

* **Indexes:** `idx_topics_category_created` (`category`, `created_at DESC`), `idx_topics_trending` (`is_trending`), `idx_topics_author` (`author_id`).

---

### 4.3 `comments` Entity

Stores hierarchical, nested replies attached to topics.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique comment identifier. |
| `topic_id` | `UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Associated parent topic ID. |
| `parent_comment_id`|`UUID` | `FK -> comments(id) ON DELETE CASCADE`, `NULL` | `UUID` | Parent comment ID for nested replies. `NULL` for top-level. |
| `author_id` | `UUID` | `FK -> users(id) ON DELETE SET NULL` | `UUID` | Comment author user ID. |
| `is_anonymous` | `BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Anonymous comment toggle flag. |
| `anonymous_id` | `VARCHAR(50)` | `NULL` | `String` | Thread alias (e.g. `Anon #402`). |
| `body` | `TEXT` | `NOT NULL` | `String` | Comment text body. |
| `media_url` | `TEXT` | `NULL` | `String` | Cloudinary CDN URL for media attachment. |
| `media_type` | `VARCHAR(20)` | `NULL` | `MediaType` Enum| Enum: `IMAGE`, `VIDEO`. |
| `likes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Upvote count. |
| `dislikes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Downvote count. |
| `depth` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Tree depth level (0 = top-level, max 5). |
| `status` | `VARCHAR(20)` | `NOT NULL`, Default `'ACTIVE'` | `CommentStatus` Enum| Enum: `ACTIVE`, `DELETED`, `FLAGGED`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Modification timestamp. |

* **Indexes:** `idx_comments_topic_id` (`topic_id`, `created_at ASC`), `idx_comments_parent_id` (`parent_comment_id`).

---

### 4.4 `polls` Entity

Stores poll metadata attached to a topic post.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique poll identifier. |
| `topic_id` | `UUID` | `FK -> topics(id) ON DELETE CASCADE`, `UNIQUE`, `NOT NULL` | `UUID` | One-to-One mapping with parent topic. |
| `question` | `TEXT` | `NOT NULL` | `String` | Main poll question. |
| `is_multiple_choice`|`BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Flag allowing multiple option selection. |
| `total_votes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Total accumulated votes count. |
| `status` | `VARCHAR(20)` | `NOT NULL`, Default `'OPEN'` | `PollStatus` Enum | Enum: `OPEN`, `CLOSED`. |
| `closes_at` | `TIMESTAMPTZ` | `NULL` | `Instant` | Poll expiration timestamp. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Poll creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Poll update timestamp. |

* **Indexes:** `idx_polls_topic_id` (`topic_id`).

---

### 4.5 `poll_options` Entity

Stores individual voting options belonging to a poll.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique poll option identifier. |
| `poll_id` | `UUID` | `FK -> polls(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Parent poll ID. |
| `option_order` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Display position index (0, 1, 2...). |
| `label` | `VARCHAR(255)`| `NOT NULL` | `String` | Text option label displayed to users. |
| `votes` | `INTEGER` | `NOT NULL`, Default `0` | `Integer` | Vote count for this specific option. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Creation timestamp. |

* **Indexes:** `idx_poll_options_poll_id` (`poll_id`, `option_order ASC`).

---

### 4.6 `user_poll_votes` Entity (State Junction Table)

Tracks user voting choices to prevent duplicate votes per poll.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Voting user ID. |
| `poll_id` | `UUID` | `FK -> polls(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Target poll ID. |
| `option_id` | `UUID` | `FK -> poll_options(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Chosen option ID. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Vote timestamp. |

* **Primary Key:** `PRIMARY KEY (user_id, poll_id)` — Enforces exactly 1 vote per user per poll at database level!

---

### 4.7 `topic_reactions` Entity (State Junction Table)

Tracks user likes and dislikes on topics.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | User ID. |
| `topic_id` | `UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Topic ID. |
| `reaction_type`| `VARCHAR(10)` | `NOT NULL`, `CHECK (reaction_type IN ('LIKE', 'DISLIKE'))` | `ReactionType` Enum | Enum: `LIKE`, `DISLIKE`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Reaction timestamp. |

* **Primary Key:** `PRIMARY KEY (user_id, topic_id)` — Prevents multiple reactions per user on the same topic.

---

### 4.8 `comment_reactions` Entity (State Junction Table)

Tracks user likes and dislikes on comment nodes.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | User ID. |
| `comment_id` | `UUID` | `FK -> comments(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Comment ID. |
| `reaction_type`| `VARCHAR(10)` | `NOT NULL`, `CHECK (reaction_type IN ('LIKE', 'DISLIKE'))` | `ReactionType` Enum | Enum: `LIKE`, `DISLIKE`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Reaction timestamp. |

* **Primary Key:** `PRIMARY KEY (user_id, comment_id)` — Enforces single reaction per comment.

---

### 4.9 `saved_topics` Entity (State Junction Table)

Stores user topic bookmarks.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | User ID. |
| `topic_id` | `UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Bookmarked Topic ID. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Bookmark timestamp. |

* **Primary Key:** `PRIMARY KEY (user_id, topic_id)`.

---

### 4.10 `notifications` Entity

Personal notifications dispatched to specific users.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique notification ID. |
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Recipient user ID. |
| `type` | `VARCHAR(30)` | `NOT NULL` | `NotificationType` Enum| Enum: `REPLY`, `LIKE_MILESTONE`, `TRENDING`, `REPORT_RESOLVED`, `NEW_POLL`, `NEW_TOPIC`. |
| `title` | `VARCHAR(255)`| `NOT NULL` | `String` | Notification header title. |
| `body` | `TEXT` | `NOT NULL` | `String` | Detailed alert message. |
| `is_read` | `BOOLEAN` | `NOT NULL`, Default `false` | `Boolean` | Read/unread flag. |
| `related_topic_id`|`UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NULL` | `UUID` | Associated topic for navigation. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Creation timestamp. |

* **Indexes:** `idx_notifications_user` (`user_id`, `is_read`, `created_at DESC`).

---

### 4.11 `global_notifications` Entity

Broadcast notifications delivered to all platform users.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique global notification ID. |
| `type` | `VARCHAR(30)` | `NOT NULL` | `NotificationType` Enum| Enum: `NEW_TOPIC`, `NEW_POLL`, `SYSTEM_ANNOUNCEMENT`. |
| `title` | `VARCHAR(255)`| `NOT NULL` | `String` | Broadcast title. |
| `body` | `TEXT` | `NOT NULL` | `String` | Broadcast body content. |
| `related_topic_id`|`UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NULL` | `UUID` | Linked topic ID. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Broadcast timestamp. |

---

### 4.12 `user_read_global_notifications` Entity (State Junction Table)

Tracks individual user read receipts for global broadcast notifications.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `user_id` | `UUID` | `FK -> users(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | User ID. |
| `global_notification_id`| `UUID` | `FK -> global_notifications(id) ON DELETE CASCADE`, `NOT NULL` | `UUID` | Global notification ID. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Read receipt timestamp. |

* **Primary Key:** `PRIMARY KEY (user_id, global_notification_id)`.

---

### 4.13 `reports` Entity

Stores content flags submitted by users for moderation review.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique report identifier. |
| `reporter_id` | `UUID` | `FK -> users(id) ON DELETE SET NULL` | `UUID` | Reporting user ID. |
| `target_type` | `VARCHAR(20)` | `NOT NULL` | `ReportTargetType` Enum| Enum: `TOPIC`, `COMMENT`, `USER`. |
| `target_topic_id`|`UUID` | `FK -> topics(id) ON DELETE CASCADE`, `NULL` | `UUID` | Flagged Topic ID. |
| `target_comment_id`|`UUID`| `FK -> comments(id) ON DELETE CASCADE`, `NULL` | `UUID` | Flagged Comment ID. |
| `target_user_id` |`UUID` | `FK -> users(id) ON DELETE CASCADE`, `NULL` | `UUID` | Flagged User ID. |
| `reason` | `VARCHAR(50)` | `NOT NULL` | `ReportReason` Enum | Enum: `SPAM`, `HARASSMENT`, `MISINFORMATION`, `HATE_SPEECH`, `OTHER`. |
| `details` | `TEXT` | `NULL` | `String` | Optional explanatory text. |
| `status` | `VARCHAR(20)` | `NOT NULL`, Default `'PENDING'` | `ReportStatus` Enum | Enum: `PENDING`, `APPROVED`, `DISMISSED`. |
| `reviewer_id` | `UUID` | `FK -> users(id) ON DELETE SET NULL`, `NULL` | `UUID` | Moderator/Admin ID who resolved report. |
| `reviewer_notes`| `TEXT` | `NULL` | `String` | Administrative resolution notes. |
| `resolved_at` | `TIMESTAMPTZ` | `NULL` | `Instant` | Timestamp of resolution. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Submission timestamp. |

* **Indexes:** `idx_reports_status` (`status`, `created_at DESC`).

---

### 4.14 `audit_logs` Entity

Immutable administrative action audit trail for security and compliance tracking.

| Column Name | SQL Type | Constraints | JPA / Java Type | Description & Business Rules |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | `UUID` | Unique audit log ID. |
| `actor_id` | `UUID` | `FK -> users(id) ON DELETE SET NULL` | `UUID` | Admin/Mod user ID who performed action. |
| `action` | `VARCHAR(100)`| `NOT NULL` | `String` | Executed command (e.g., `DELETE_TOPIC`, `BAN_USER`). |
| `target_type` | `VARCHAR(50)` | `NOT NULL` | `String` | Entity type affected (`TOPIC`, `USER`, `COMMENT`). |
| `target_id` | `UUID` | `NOT NULL` | `UUID` | Affected entity ID. |
| `details_json` | `JSONB` | `NULL` | `String` | JSON contextual payload detailing changes. |
| `ip_address` | `VARCHAR(45)` | `NULL` | `String` | IP address of performing client. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | `Instant` | Action timestamp. |

---

## 5. Comprehensive System Workflows & Behavioral Mechanics

### 5.1 Authentication & Token Lifecycle Workflow

```
[ Client ] -- 1. POST /api/v1/auth/login (email, password) --> [ Spring Security Filter ]
                                                                      │
                                                             2. Verify BCrypt Hash
                                                                      │
[ Client ] <-- 3. Return Access JWT (15m) + Refresh Token (7d) <-------┘
   │
   ├── 4. Request with Header: "Authorization: Bearer <Access_JWT>"
   │
   └── 5. When Access JWT expires -> POST /api/v1/auth/refresh (RefreshToken)
          Backend checks Redis whitelist -> Issue new Access JWT
```

1. **Password Hashing:** User passwords are hashed using `BCryptPasswordEncoder` with strength factor 12.
2. **Stateless JWT Access Token:** Signed using HMAC-SHA512. Standard claims include `sub` (User ID), `role`, `nickname`, `exp` (15 minutes expiry).
3. **Refresh Token & Redis Session Control:** Refresh tokens (7 days expiry) are stored in Redis (`session:<user_id>:<token_uuid>`). On logout or administrative user ban, the session key in Redis is purged, revoking all active refresh tokens instantly.
4. **Guest Mode Flow:** Guests receive temporary anonymous tokens without database persistence. Upon user registration, local guest bookmarks and preferences are transferred via `POST /api/v1/auth/convert-guest`.

---

### 5.2 Cloudinary Media Upload & CDN Delivery Workflow

```
[ Client (Mobile / Admin Web) ]
   │
   ├── Option 1: Request Signed Signature -- GET /api/v1/media/upload-signature --> [ Spring Boot ]
   │                                                                                     │
   │   <-- Return { timestamp, signature, apiKey, cloudName, folder } --------------------┘
   │
   ├── Option 2: Upload File Directly to Cloudinary CDN via Signature / Preset
   │   POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
   │
   ▼
[ Cloudinary CDN ]
   Returns: secure_url (e.g. https://res.cloudinary.com/safevoice-app/image/upload/v169000/topics/img_12.jpg)
   │
   ▼
[ Mobile / Admin Client ] -> Passes secure_url in POST /api/v1/topics or POST /api/v1/comments
```

1. **Direct Backend Upload API (`POST /api/v1/media/upload`):** Accepts `MultipartFile`, uploads to Cloudinary via `cloudinary.uploader().upload(...)`, and returns the CDN HTTPS URL.
2. **Client-Side Direct Signed Upload (`GET /api/v1/media/upload-signature`):** Generates SHA-1 signature using Cloudinary API Secret for direct upload from mobile/web clients to Cloudinary API, bypassing Spring Boot server memory/bandwidth overhead.
3. **Automatic Cloudinary Image Transformations:**
   - Topic Attachments: `c_limit,w_1200,h_1200,f_auto,q_auto`
   - User Avatars: `c_fill,g_face,w_300,h_300,r_max,f_auto,q_auto`

---

### 5.3 Topics Feed & Ranking Algorithms

When a client queries `GET /api/v1/topics?sort={sort}&category={cat}`, the backend executes optimized SQL or JPQL queries based on the requested sort mode:

* **`latest` (Newest Posts):**
  ```sql
  SELECT * FROM topics WHERE status = 'ACTIVE' ORDER BY created_at DESC;
  ```
* **`trending` (Dynamic Recency & Engagement Score):**
  Calculated using gravity-decay scoring formula:
  $$\text{Score} = \frac{\text{likes} \times 2.0 + \text{comment\_count} \times 3.0 + \text{views} \times 0.2}{(\text{hours\_since\_creation} + 2.0)^{1.5}}$$
  A scheduled background job updates `is_trending = true` for topics scoring above the 90th percentile threshold every 15 minutes.
* **`most_commented`:**
  ```sql
  SELECT * FROM topics WHERE status = 'ACTIVE' ORDER BY comment_count DESC, created_at DESC;
  ```
* **`most_liked`:**
  ```sql
  SELECT * FROM topics WHERE status = 'ACTIVE' ORDER BY likes DESC, created_at DESC;
  ```

---

### 5.4 Reaction Mechanics & Atomic Counter Integrity

To prevent race conditions during concurrent user reactions:

1. When a user submits `POST /api/v1/topics/{id}/reaction` with payload `{"reactionType": "LIKE"}`:
2. An `UPSERT` operation is performed on `topic_reactions`:
   ```sql
   INSERT INTO topic_reactions (user_id, topic_id, reaction_type)
   VALUES ('u_100', 't_500', 'LIKE')
   ON CONFLICT (user_id, topic_id) 
   DO UPDATE SET reaction_type = EXCLUDED.reaction_type;
   ```
3. A PostgreSQL database trigger `trg_topic_reactions` executes automatically to increment/decrement `topics.likes` and `topics.dislikes` atomically without application locks.

---

### 5.5 Hierarchical Nested Comment Tree Logic

1. **Tree Construction:** Comments are fetched flat ordered by `created_at ASC` and reconstructed into a tree structure in memory by matching `parent_comment_id`.
2. **Depth Cap Enforcement:** Maximum nesting depth is capped at `depth = 5`. If a user attempts to reply to a comment at `depth = 5`, the backend automatically attaches the reply to the `parent_comment_id` of depth 5, preventing infinitely deep indentation on client screens.
3. **Thread Alias Mapping:**
   When `is_anonymous = true`, the backend computes:
   $$\text{Alias} = \text{"Anon \#"} + (\text{ABS(HASH}(user\_id \mathbin{\Vert} topic\_id)) \bmod 900 + 100)$$

---

### 5.6 Interactive Poll Engine & STOMP WebSocket Sync

```
[ User Client ] -- 1. POST /api/v1/polls/{pollId}/vote (optionId) --> [ Spring Boot Service ]
                                                                             │
                                                                   2. Validate Poll Status (OPEN)
                                                                   3. DB Insert user_poll_votes
                                                                   4. Triggers update vote counters
                                                                             │
[ STOMP Broker ] <-- 5. Broadcast Updated Vote Percentages DTO <-------------┘
       │
       ▼  Destination: /topic/polls/{pollId}
[ Mobile Subscribed Clients ] (UI bars update live without page reload!)
```

1. **Vote Validation:** Checks that `closes_at > NOW()` and `status = 'OPEN'`.
2. **Atomic DB Insertion:** Inserts into `user_poll_votes`. If duplicate vote occurs, DB throws `UniqueConstraintViolationException`, mapped to `HTTP 409 Conflict`.
3. **Real-time STOMP Push:** Upon vote success, `SimpMessagingTemplate` broadcasts the updated poll state DTO to STOMP destination `/topic/polls/{pollId}`:
   ```json
   {
     "pollId": "p_901",
     "totalVotes": 142,
     "options": [
       { "id": "opt_1", "votes": 98, "percentage": 69.01 },
       { "id": "opt_2", "votes": 44, "percentage": 30.99 }
     ]
   }
   ```

---

### 5.7 Content Moderation & Reporting Workflow

```
[ User ] -- Flag Content --> [ POST /api/v1/reports ]
                                    │
                                    ▼ Status = 'PENDING'
                         [ Moderation Queue ]
                                    │
                         [ Moderator Action ]
             ┌──────────────────────┼──────────────────────┐
             ▼                      ▼                      ▼
    [ Action: Dismiss ]   [ Action: Soft Delete ]  [ Action: Ban User ]
    Status = DISMISSED    topic.status = DELETED   user.status = BANNED
                                    │                      │
                                    └──────────┬───────────┘
                                               ▼
                                  [ Write Immutable Audit Log ]
```

1. **Flag Submission:** Authenticated users flag posts/comments selecting reason `SPAM`, `HARASSMENT`, `MISINFORMATION`, etc.
2. **Mod Review:** Moderators view queue sorted by report count.
3. **Resolution Execution:**
   - `SOFT_DELETE`: Topic/Comment `status` set to `'DELETED'`. Content replaced with `"[This content has been removed for violating community guidelines]"`.
   - `SUSPEND_USER`: Sets `users.status = 'SUSPENDED'` for a duration, revoking write APIs.
   - `AUDIT_LOG`: Every action writes an entry to `audit_logs`.

---

## 6. Complete Production PostgreSQL DDL Script (`database_schema.sql`)

```sql
-- SafeVoice Production Database Schema (PostgreSQL 15+)
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MODERATOR', 'ADMIN')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  comments_count INTEGER NOT NULL DEFAULT 0,
  likes_received INTEGER NOT NULL DEFAULT 0,
  poll_votes_count INTEGER NOT NULL DEFAULT 0,
  member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Topics Table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('CIVIC', 'SAFETY', 'EDUCATION', 'COMMUNITY', 'GENERAL', 'POLLS')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_is_anonymous BOOLEAN NOT NULL DEFAULT false,
  media_url TEXT,
  media_type VARCHAR(20) CHECK (media_type IN ('IMAGE', 'VIDEO')),
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  has_poll BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'HIDDEN', 'DELETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  anonymous_id VARCHAR(50),
  body TEXT NOT NULL,
  media_url TEXT,
  media_type VARCHAR(20) CHECK (media_type IN ('IMAGE', 'VIDEO')),
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0 AND depth <= 5),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DELETED', 'FLAGGED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Polls Table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID UNIQUE NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  total_votes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Poll Options Table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_order INTEGER NOT NULL DEFAULT 0,
  label VARCHAR(255) NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. User Poll Votes Table (Junction)
CREATE TABLE user_poll_votes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, poll_id)
);

-- 7. Topic Reactions Table (Junction)
CREATE TABLE topic_reactions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('LIKE', 'DISLIKE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 8. Comment Reactions Table (Junction)
CREATE TABLE comment_reactions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('LIKE', 'DISLIKE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- 9. Saved Topics Table (Junction)
CREATE TABLE saved_topics (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 10. Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('REPLY', 'LIKE_MILESTONE', 'TRENDING', 'REPORT_RESOLVED', 'NEW_POLL', 'NEW_TOPIC')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Global Notifications Table
CREATE TABLE global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL CHECK (type IN ('NEW_TOPIC', 'NEW_POLL', 'SYSTEM_ANNOUNCEMENT')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  related_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. User Read Global Notifications Table (Junction)
CREATE TABLE user_read_global_notifications (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  global_notification_id UUID NOT NULL REFERENCES global_notifications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, global_notification_id)
);

-- 13. Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('TOPIC', 'COMMENT', 'USER')),
  target_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  target_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('SPAM', 'HARASSMENT', 'MISINFORMATION', 'HATE_SPEECH', 'OTHER')),
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISMISSED')),
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  details_json JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index Definitions
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_topics_category_created ON topics(category, created_at DESC);
CREATE INDEX idx_topics_trending ON topics(is_trending);
CREATE INDEX idx_topics_author ON topics(author_id);
CREATE INDEX idx_comments_topic ON comments(topic_id, created_at ASC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_polls_topic ON polls(topic_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);

-- Triggers for Reaction Counters
CREATE OR REPLACE FUNCTION update_topic_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'LIKE' THEN
      UPDATE topics SET likes = GREATEST(0, likes - 1) WHERE id = OLD.topic_id;
    ELSIF OLD.reaction_type = 'DISLIKE' THEN
      UPDATE topics SET dislikes = GREATEST(0, dislikes - 1) WHERE id = OLD.topic_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'LIKE' THEN
      UPDATE topics SET likes = likes + 1 WHERE id = NEW.topic_id;
    ELSIF NEW.reaction_type = 'DISLIKE' THEN
      UPDATE topics SET dislikes = dislikes + 1 WHERE id = NEW.topic_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.reaction_type = 'LIKE' AND NEW.reaction_type = 'DISLIKE' THEN
      UPDATE topics SET likes = GREATEST(0, likes - 1), dislikes = dislikes + 1 WHERE id = NEW.topic_id;
    ELSIF OLD.reaction_type = 'DISLIKE' AND NEW.reaction_type = 'LIKE' THEN
      UPDATE topics SET dislikes = GREATEST(0, dislikes - 1), likes = likes + 1 WHERE id = NEW.topic_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_topic_reactions
AFTER INSERT OR UPDATE OR DELETE ON topic_reactions
FOR EACH ROW EXECUTE FUNCTION update_topic_reaction_counts();

-- Trigger for Poll Vote Aggregation
CREATE OR REPLACE FUNCTION update_poll_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE poll_options SET votes = votes + 1 WHERE id = NEW.option_id;
    UPDATE polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
    UPDATE users SET poll_votes_count = poll_votes_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_poll_votes
AFTER INSERT ON user_poll_votes
FOR EACH ROW EXECUTE FUNCTION update_poll_vote_counts();
```

---

## 7. Spring Boot 3 Backend Implementation Blueprint

### 7.1 Recommended Package Structure

```
com.safevoice
├── config
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   └── CloudinaryConfig.java
├── controller
│   ├── AuthController.java
│   ├── TopicController.java
│   ├── CommentController.java
│   ├── PollController.java
│   ├── MediaController.java
│   ├── NotificationController.java
│   └── AdminController.java
├── dto
│   ├── request (LoginRequest, CreateTopicRequest, CreateCommentRequest, VoteRequest)
│   └── response (JwtResponse, TopicResponseDTO, CommentResponseDTO, PollResponseDTO, MediaUploadResponseDTO)
├── entity
│   ├── User.java
│   ├── Topic.java
│   ├── Comment.java
│   ├── Poll.java
│   ├── PollOption.java
│   ├── Report.java
│   └── AuditLog.java
├── repository
│   ├── UserRepository.java
│   ├── TopicRepository.java
│   ├── CommentRepository.java
│   └── PollRepository.java
├── security
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── UserPrincipal.java
└── service
    ├── AuthService.java
    ├── TopicService.java
    ├── CommentService.java
    ├── PollService.java
    ├── CloudinaryService.java
    └── ModerationService.java
```

---

### 7.2 Complete REST API Endpoints Specification

#### Authentication Endpoints
* `POST /api/v1/auth/register` — Body: `{email, password, nickname}` -> Returns JWT & User DTO.
* `POST /api/v1/auth/login` — Body: `{email, password}` -> Returns `{accessToken, refreshToken, user}`.
* `POST /api/v1/auth/refresh` — Header: `Bearer <RefreshToken>` -> Returns new Access Token.
* `POST /api/v1/auth/logout` — Revokes refresh token in Redis.

#### Media & File Storage Endpoints (Cloudinary Integration)
* `POST /api/v1/media/upload` — `[Auth Required]` Multipart upload of image/video file to Cloudinary. Returns `{url, publicId, mediaType}`.
* `GET /api/v1/media/upload-signature` — `[Auth Required]` Requests signed parameters (timestamp, signature, apiKey) for direct client-side upload to Cloudinary.

#### Topics & Discussion Endpoints
* `GET /api/v1/topics?category={cat}&sort={sort}&page={page}&size=20` — Public feed query.
* `GET /api/v1/topics/{id}` — Fetch detailed topic & increment view counter.
* `POST /api/v1/topics` — `[Auth Required]` Create post. Body: `{category, title, description, isAnonymous, mediaUrl, poll}`.
* `PUT /api/v1/topics/{id}` — `[Auth Required]` Edit own topic.
* `DELETE /api/v1/topics/{id}` — `[Auth Required]` Soft delete topic.
* `POST /api/v1/topics/{id}/reaction` — `[Auth Required]` Body: `{"reactionType": "LIKE" | "DISLIKE"}`.
* `POST /api/v1/topics/{id}/save` — `[Auth Required]` Bookmark toggle topic.

#### Comments Endpoints
* `GET /api/v1/topics/{topicId}/comments` — Fetch comment tree structure.
* `POST /api/v1/topics/{topicId}/comments` — `[Auth Required]` Post comment or nested reply. Body: `{parentCommentId, body, isAnonymous, mediaUrl}`.
* `POST /api/v1/comments/{commentId}/reaction` — `[Auth Required]` Like/Dislike comment.

#### Polls Endpoints
* `GET /api/v1/polls/{id}` — Fetch poll details & voting status for active user.
* `POST /api/v1/polls/{id}/vote` — `[Auth Required]` Submit vote. Body: `{optionId}`.

#### Moderation & Admin Endpoints
* `POST /api/v1/reports` — `[Auth Required]` Flag post/comment. Body: `{targetType, targetTopicId, targetCommentId, reason, details}`.
* `GET /api/v1/admin/reports?status=PENDING` — `[Mod/Admin]` List flagged queue.
* `PUT /api/v1/admin/reports/{id}/resolve` — `[Mod/Admin]` Execute action: `{action: "DISMISS"|"DELETE_CONTENT"|"SUSPEND_USER", notes}`.
* `GET /api/v1/admin/metrics` — `[Admin]` System telemetry dashboard metrics.

#### WebSocket STOMP Channels
* `SUBSCRIBE /topic/polls/{pollId}` — Live voting broadcast updates.
* `SUBSCRIBE /user/queue/notifications` — Private real-time notifications queue.

---

## 8. Verification & Delivery Checklist

Backend developers can verify complete compliance using this checklist:
- [x] All 14 database tables and junction entities defined with exact data types and constraints.
- [x] Cloudinary media cloud architecture, Maven dependencies, signed signature generation, and CDN delivery specified.
- [x] PostgreSQL DDL script ready for automated Flyway migration (`V1__init_schema.sql`).
- [x] RBAC permissions matrix covering Guest, User, Moderator, Admin, and System roles.
- [x] Thread-scoped anonymous ID generation algorithm and API payload masking specified.
- [x] Topic feed sorting algorithms (`Latest`, `Trending`, `Most Liked`, `Most Commented`) defined.
- [x] Single-vote constraint enforcement and STOMP WebSocket broadcast schema detailed.
- [x] Full REST API endpoint specification mapped to HTTP controllers.
