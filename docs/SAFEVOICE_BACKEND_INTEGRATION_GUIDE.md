# SafeVoice Backend Integration Guide & API Specification
**For Frontend Web Developers & React Native Mobile App Developers**

Version: `1.0.0`  
Base REST URL: `http://localhost:8080/api/v1` (or your staging/production host)  
Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`  
OpenAPI 3 JSON Docs: `http://localhost:8080/v3/api-docs`  
Base WebSocket STOMP Endpoint: `http://localhost:8080/ws` (SockJS) or `ws://localhost:8080/ws` (Native WebSocket)  
Authentication Header: `Authorization: Bearer <AccessToken>`

---

## 1. Executive Architecture Summary

The **SafeVoice** backend is a high-performance, security-hardened Spring Boot 4 REST API and WebSocket STOMP platform designed for safe civic discourse, anonymous whistleblowing/reporting, interactive polling, real-time notifications, and moderation.

### Core Developer Mechanics to Note:
1. **Stateless JWT + Redis Session Lifecycle**:
   - Access tokens are short-lived JWTs passed in `Authorization: Bearer <AccessToken>`.
   - Refresh tokens are verified against Redis (`session:<user_id>:<token>`).
   - Logging out, password changing, account suspension, or banning automatically purges Redis session keys, instantly revoking API access across all client devices.
2. **Thread-Scoped Anonymous Author Masking**:
   - When a topic or comment has `isAnonymous: true`, the public API payload returns `author: null` and populates `authorNickname: "Anon #NNN"`.
   - The alias `Anon #NNN` is thread-consistent (the same user posting multiple comments in Topic A receives the same alias in Topic A, but a different alias in Topic B).
3. **Admin/Moderator Topic Creation Privileges**:
   - Topics can be created (`POST /api/v1/topics`), edited (`PUT /api/v1/topics/{id}`), and soft-deleted (`DELETE /api/v1/topics/{id}`) **only** by `ADMIN` or `MODERATOR` accounts.
   - Regular `USER` accounts can view, react (`LIKE`/`DISLIKE`), bookmark/save, comment, and vote on polls.
4. **Depth Cap Level 5 Hierarchical Comment Trees**:
   - `GET /api/v1/topics/{topicId}/comments` returns a pre-assembled nested JSON tree (`replies`).
   - Replying to comments at `depth >= 5` automatically caps nesting level at 5, keeping mobile and web UI layouts clean.
5. **Media Upload & Content Moderation**:
   - Profile images use curated avatar catalogs (`GET /api/v1/media/avatars`) to protect personal identity.
   - File uploads (`POST /api/v1/media/upload`) run automated Cloudinary safety moderation (`aws_rek:nudity:explicit_nudity:suggestive:violence`). Moderation failures reject the upload with `HTTP 400 Bad Request`.
6. **Real-Time STOMP WebSockets**:
   - Live poll voting progress updates push to `/topic/polls/{pollId}`.
   - Targeted personal notifications push to `/user/queue/notifications`.
   - Global civic announcement alerts push to `/topic/announcements`.

---

## 2. Authentication & Session Endpoints

### 2.1 Register User
`POST /api/v1/auth/register`  
*Access*: Public

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "nickname": "CitizenGuardian"
}
```

#### Response (`201 Created`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "d8f7e2a9-1b3c-4d5e...",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": {
    "id": "c1f7a8e2-9b3c-4d5e-8f9a-0b1c2d3e4f5a",
    "email": "user@example.com",
    "nickname": "CitizenGuardian",
    "avatarUrl": "https://res.cloudinary.com/.../avatar_shield.png",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-07-25T10:15:00Z"
  }
}
```

---

### 2.2 User Login
`POST /api/v1/auth/login`  
*Access*: Public

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

#### Response (`200 OK`):
Same JSON envelope as Registration containing `accessToken`, `refreshToken`, and `user`.

---

### 2.3 Refresh Access Token
`POST /api/v1/auth/refresh`  
*Access*: Public (Pass Refresh Token in Header)  
*Header*: `Authorization: Bearer <RefreshToken>`

#### Response (`200 OK`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.new_token...",
  "refreshToken": "d8f7e2a9-1b3c-4d5e...",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": { ... }
}
```

---

### 2.4 Logout
`POST /api/v1/auth/logout`  
*Access*: Authenticated  
*Header*: `Authorization: Bearer <AccessToken>`

#### Response (`200 OK`):
```json
{
  "message": "Successfully logged out. Session invalidated."
}
```

---

### 2.5 Active User Profile (`/me`)
`GET /api/v1/auth/me`  
*Access*: Authenticated

#### Response (`200 OK`):
Returns the active `UserResponseDTO` payload.

---

### 2.6 Convert Guest Data
`POST /api/v1/auth/convert-guest`  
*Access*: Authenticated  
*Query Parameter*: `?guestId=guest-uuid-string`

Transfers temporary guest bookmarks and read notifications to the newly authenticated account.

---

## 3. Media & Profile Avatars Endpoints

### 3.1 Fetch Default Avatar Catalog
`GET /api/v1/media/avatars`  
*Access*: Public

#### Response (`200 OK`):
```json
[
  {
    "id": "avatar_shield",
    "name": "Community Shield",
    "url": "https://res.cloudinary.com/demo/image/upload/v1720000000/avatars/shield.png"
  },
  {
    "id": "avatar_guardian",
    "name": "Anonymous Guardian",
    "url": "https://res.cloudinary.com/demo/image/upload/v1720000000/avatars/guardian.png"
  }
]
```

---

### 3.2 Upload Media File
`POST /api/v1/media/upload`  
*Access*: Authenticated  
*Content-Type*: `multipart/form-data`

#### Form Parameters:
- `file`: Binary file (Images <= 10MB, Videos <= 50MB)
- `folder`: `"topics"` or `"comments"`

#### Response (`200 OK`):
```json
{
  "url": "https://res.cloudinary.com/safevoice/image/upload/v1720000000/topics/sample.jpg",
  "publicId": "safevoice/topics/sample",
  "mediaType": "IMAGE",
  "format": "jpg",
  "sizeBytes": 245890
}
```
*Note*: Files failing automated Rekognition moderation (`nudity`, `violence`) throw `HTTP 400 Bad Request` with message: `"Media failed automated safety moderation content checks."`

---

### 3.3 Get Cloudinary Signed Parameters
`GET /api/v1/media/upload-signature`  
*Access*: Authenticated

Returns `timestamp`, `signature`, `apiKey`, `cloudName`, and `uploadPreset` for direct client-to-Cloudinary SDK uploads.

---

## 4. User Profile Management Endpoints

### 4.1 Get Public User Profile
`GET /api/v1/users/{id}`  
*Access*: Public

#### Response (`200 OK`):
```json
{
  "id": "c1f7a8e2-9b3c-4d5e-8f9a-0b1c2d3e4f5a",
  "email": "user@example.com",
  "nickname": "CitizenGuardian",
  "avatarUrl": "https://res.cloudinary.com/.../shield.png",
  "bio": "Advocating for local community safety and civic engagement.",
  "role": "USER",
  "status": "ACTIVE",
  "topicsCount": 12,
  "commentsCount": 48,
  "pollVotesCount": 35,
  "createdAt": "2026-07-25T10:15:00Z"
}
```

---

### 4.2 Update Active Profile
`PUT /api/v1/users/me`  
*Access*: Authenticated

#### Request Body:
```json
{
  "nickname": "UpdatedGuardian",
  "bio": "Updated civic bio message.",
  "avatarUrl": "https://res.cloudinary.com/.../new_avatar.png"
}
```

---

### 4.3 Change Password
`PUT /api/v1/users/me/password`  
*Access*: Authenticated

#### Request Body:
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewStrongPassword456!"
}
```
*Note*: Purges all active sessions across devices, requiring re-login.

---

## 5. Topics & Discussion Endpoints

### 5.1 Query Public Feed
`GET /api/v1/topics?category={cat}&sort={sort}&page={page}&size=20`  
*Access*: Public

#### Query Parameters:
- `category`: `CIVIC` | `SAFETY` | `EDUCATION` | `COMMUNITY` | `GENERAL` | `POLLS` (Optional)
- `sort`: `latest` | `trending` | `most_commented` | `most_liked` (Default: `latest`)
- `page`: Page index starting at `0`
- `size`: Items per page (Default: `20`)

#### Response (`200 OK`):
```json
{
  "content": [
    {
      "id": "t_901a8e2-9b3c-4d5e-8f9a-0b1c2d3e4f5a",
      "category": "SAFETY",
      "title": "Community Streetlight Safety Initiative",
      "description": "Discussing lighting improvements in Sector 4...",
      "author": null,
      "authorNickname": "Anon #402",
      "isAnonymous": true,
      "mediaUrl": "https://res.cloudinary.com/.../light.jpg",
      "mediaType": "IMAGE",
      "likes": 42,
      "dislikes": 2,
      "commentCount": 15,
      "views": 310,
      "hasPoll": true,
      "isTrending": true,
      "status": "ACTIVE",
      "createdAt": "2026-07-25T11:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

### 5.2 Get Detailed Topic View
`GET /api/v1/topics/{id}`  
*Access*: Public (Send `Authorization` header if authenticated to populate `myReaction` and `isSavedByMe`)

#### Response (`200 OK`):
```json
{
  "id": "t_901a8e2-9b3c-4d5e-8f9a-0b1c2d3e4f5a",
  "category": "SAFETY",
  "title": "Community Streetlight Safety Initiative",
  "description": "Full topic detailed description...",
  "author": null,
  "authorNickname": "Anon #402",
  "isAnonymous": true,
  "mediaUrl": "https://res.cloudinary.com/.../light.jpg",
  "mediaType": "IMAGE",
  "likes": 42,
  "dislikes": 2,
  "commentCount": 15,
  "views": 311,
  "hasPoll": true,
  "poll": {
    "id": "p_801",
    "topicId": "t_901a8e2-9b3c-4d5e-8f9a-0b1c2d3e4f5a",
    "question": "Should Sector 4 install solar streetlights?",
    "isMultipleChoice": false,
    "totalVotes": 100,
    "status": "OPEN",
    "closesAt": "2026-08-01T00:00:00Z",
    "options": [
      { "id": "opt_1", "optionOrder": 0, "label": "Yes, Solar Lights", "votes": 75, "percentage": 75.0 },
      { "id": "opt_2", "optionOrder": 1, "label": "No, Standard Grid", "votes": 25, "percentage": 25.0 }
    ],
    "userVotedOptionIds": ["opt_1"]
  },
  "isTrending": true,
  "status": "ACTIVE",
  "myReaction": "LIKE",
  "isSavedByMe": true,
  "createdAt": "2026-07-25T11:00:00Z",
  "updatedAt": "2026-07-25T11:00:00Z"
}
```

---

### 5.3 Create Topic
`POST /api/v1/topics`  
*Access*: `ADMIN` or `MODERATOR` Role Required

#### Request Body:
```json
{
  "category": "CIVIC",
  "title": "Town Hall Budget Discussion",
  "description": "Reviewing local infrastructure allocations.",
  "isAnonymous": false,
  "mediaUrl": "https://res.cloudinary.com/.../townhall.jpg",
  "mediaType": "IMAGE",
  "poll": {
    "question": "Approve civic budget allocation?",
    "options": ["Approve", "Reject", "Need More Details"],
    "isMultipleChoice": false,
    "closesAt": "2026-08-10T00:00:00Z"
  }
}
```

---

### 5.4 Reaction Toggle (Like / Dislike)
`POST /api/v1/topics/{id}/reaction`  
*Access*: Authenticated

#### Request Body:
```json
{
  "reactionType": "LIKE"
}
```
*Note*: Submitting the same reaction type toggles (removes) the reaction. Submitting the opposite type switches `LIKE` to `DISLIKE`.

---

### 5.5 Bookmark / Save Topic Toggle
`POST /api/v1/topics/{id}/save`  
*Access*: Authenticated

#### Response (`200 OK`):
```json
{
  "saved": true,
  "message": "Topic successfully saved."
}
```

---

## 6. Hierarchical Comments Endpoints

### 6.1 Get Topic Comment Tree
`GET /api/v1/topics/{topicId}/comments`  
*Access*: Public

#### Response (`200 OK`):
```json
[
  {
    "id": "c_101",
    "topicId": "t_901",
    "parentCommentId": null,
    "author": {
      "id": "u_55",
      "email": "resident@example.com",
      "nickname": "ActiveResident",
      "avatarUrl": "https://res.cloudinary.com/.../avatar.png",
      "role": "USER"
    },
    "authorNickname": "ActiveResident",
    "isAnonymous": false,
    "body": "Great initiative for Sector 4!",
    "likes": 8,
    "dislikes": 0,
    "depth": 0,
    "status": "ACTIVE",
    "myReaction": "LIKE",
    "createdAt": "2026-07-25T11:15:00Z",
    "replies": [
      {
        "id": "c_102",
        "topicId": "t_901",
        "parentCommentId": "c_101",
        "author": null,
        "authorNickname": "Anon #882",
        "isAnonymous": true,
        "body": "I agree, especially near the school road.",
        "likes": 3,
        "dislikes": 0,
        "depth": 1,
        "status": "ACTIVE",
        "replies": []
      }
    ]
  }
]
```

---

### 6.2 Post Comment or Nested Reply
`POST /api/v1/topics/{topicId}/comments`  
*Access*: Authenticated

#### Request Body:
```json
{
  "parentCommentId": "c_101",
  "body": "This is a nested reply.",
  "isAnonymous": true,
  "mediaUrl": null,
  "mediaType": null
}
```
*Depth Cap Rule*: If `parentCommentId` depth is already 5, the backend automatically attaches the new comment to parent depth 5, enforcing max depth 5.

---

### 6.3 Comment Reaction Toggle
`POST /api/v1/comments/{commentId}/reaction`  
*Access*: Authenticated  
*Body*: `{"reactionType": "LIKE" | "DISLIKE"}`

---

## 7. Interactive Polls Endpoints

### 7.1 Fetch Poll Details
`GET /api/v1/polls/{id}`  
*Access*: Public

Returns full poll details, option vote counts, server-calculated percentages, and requesting user's voted option IDs.

---

### 7.2 Submit Poll Vote
`POST /api/v1/polls/{id}/vote`  
*Access*: Authenticated

#### Request Body:
```json
{
  "optionIds": ["opt_1"]
}
```

#### Error Behaviors:
- **Duplicate Vote**: Returns `HTTP 409 Conflict` (`"You have already cast a vote on this poll."`).
- **Poll Closed/Expired**: Returns `HTTP 400 Bad Request` (`"This poll is closed or has expired."`).

*Real-Time Push*: Pushes live updated tally to STOMP channel `/topic/polls/{pollId}`.

---

## 8. Moderation & Admin Panel Endpoints

### 8.1 Submit Flag Report
`POST /api/v1/reports`  
*Access*: Authenticated

#### Request Body:
```json
{
  "targetType": "TOPIC",
  "targetTopicId": "t_901",
  "targetCommentId": null,
  "targetUserId": null,
  "reason": "HARASSMENT",
  "details": "Contains inappropriate personal attacks."
}
```

---

### 8.2 Moderation Queue Listing
`GET /api/v1/admin/reports?status=PENDING&page=0&size=20`  
*Access*: `MODERATOR` or `ADMIN` Role Required

Returns pending report queue displaying real reporter and reviewer identities for moderation auditing.

---

### 8.3 Resolve Moderation Report
`PUT /api/v1/admin/reports/{id}/resolve`  
*Access*: `MODERATOR` or `ADMIN` Role Required

#### Request Body:
```json
{
  "action": "DELETE_CONTENT",
  "notes": "Violated community guidelines on harassment."
}
```
*Actions*:
- `DISMISS`: Marks report dismissed.
- `DELETE_CONTENT`: Soft-deletes target topic/comment (`status = DELETED`) and writes audit log.
- `SUSPEND_USER`: Suspends target user, revokes Redis session keys, and writes audit log.

---

### 8.4 System Telemetry Metrics
`GET /api/v1/admin/metrics`  
*Access*: `ADMIN` Role Required

#### Response (`200 OK`):
```json
{
  "totalUsers": 1250,
  "activeUsers": 1200,
  "suspendedUsers": 40,
  "bannedUsers": 10,
  "totalTopics": 340,
  "activeTopics": 320,
  "totalComments": 4200,
  "totalPolls": 85,
  "totalPollVotes": 6800,
  "pendingReports": 5,
  "resolvedReportsLast30Days": 42,
  "newUsersLast7Days": 115,
  "newTopicsLast7Days": 38
}
```

---

### 8.5 Grant or Revoke User Roles
`PUT /api/v1/admin/users/{id}/role`  
*Access*: `ADMIN` Role Required  
*Body*: `{"role": "MODERATOR"}`

---

### 8.6 Issue User Suspension / Ban
- Temporary Suspension: `POST /api/v1/admin/users/{id}/suspend` (`[Mod/Admin]`) Body: `{"userId":"...", "duration":"DAYS_7", "reason":"..."}`
- Permanent Ban: `POST /api/v1/admin/users/{id}/ban` (`[Admin]`) Body: `{"reason":"Severe harassment violation"}`

---

### 8.7 Security Audit Logs
`GET /api/v1/admin/audit-logs?page=0&size=20`  
*Access*: `ADMIN` Role Required

Returns immutable audit trail logging actor identity, action type, target entity ID, JSON details, and client IP address.

---

## 9. Real-Time STOMP WebSocket Channels Specification

### 9.1 Connection & Handshake
- Native WebSocket URL: `ws://localhost:8080/ws`
- SockJS Fallback URL: `http://localhost:8080/ws`
- Connection Header: `Authorization: Bearer <AccessToken>`

---

### 9.2 STOMP Subscription Channels

#### Channel 1: Public Poll Real-Time Tally
- **Subscribe Destination**: `/topic/polls/{pollId}`
- **Pushed Payload**:
  ```json
  {
    "pollId": "p_801",
    "totalVotes": 101,
    "options": [
      { "id": "opt_1", "votes": 76, "percentage": 75.25 },
      { "id": "opt_2", "votes": 25, "percentage": 24.75 }
    ]
  }
  ```

#### Channel 2: Private Personal Notifications Queue
- **Subscribe Destination**: `/user/queue/notifications`
- **Pushed Payload**:
  ```json
  {
    "id": "n_501",
    "type": "REPLY",
    "title": "New Reply to Your Comment",
    "body": "Anon #882 replied to your comment: \"Great initiative for Sector 4!\"",
    "isRead": false,
    "relatedTopicId": "t_901",
    "createdAt": "2026-07-25T11:20:00Z"
  }
  ```

#### Channel 3: Global Civic Announcement Alert Channel
- **Subscribe Destination**: `/topic/announcements`
- **Pushed Payload**:
  ```json
  {
    "id": "gn_301",
    "type": "SYSTEM_ANNOUNCEMENT",
    "title": "Civic Town Hall Meeting",
    "body": "All citizens are invited to attend the Sector 4 Town Hall at 6 PM.",
    "isRead": false,
    "relatedTopicId": "t_901",
    "createdAt": "2026-07-25T12:00:00Z"
  }
  ```

---

## 10. Notification Management REST APIs

- `GET /api/v1/notifications?page=0&size=20` — Paginated user notification history.
- `GET /api/v1/notifications/unread-count` — Returns `{ "unreadCount": 3 }`.
- `PUT /api/v1/notifications/{id}/read` — Mark single notification read.
- `PUT /api/v1/notifications/read-all` — Mark all user notifications read.
- `GET /api/v1/global-notifications?page=0&size=20` — Paginated global announcements with user read state (`isRead`).
- `PUT /api/v1/global-notifications/{id}/read` — Mark global announcement read for active user.

---

## 11. Standard Error Response Envelope

All API errors return a unified JSON payload structure:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "You have already cast a vote on this poll.",
  "path": "/api/v1/polls/p_801/vote",
  "timestamp": "2026-07-25T11:30:00Z"
}
```

### HTTP Status Code Conventions:
- `200 OK`: Successful GET / PUT / POST response.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure, closed poll, or moderation media check rejection.
- `401 Unauthorized`: Missing or expired Access Token.
- `403 Forbidden`: Insufficient RBAC role permissions (e.g. regular user attempting to create a topic).
- `404 Not Found`: Target entity ID not found.
- `409 Conflict`: Resource state conflict (e.g. duplicate poll vote attempt or duplicate registration email/nickname).
- `500 Internal Server Error`: Unhandled server exception.
