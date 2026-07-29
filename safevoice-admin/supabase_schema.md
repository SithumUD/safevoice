# Supabase Database Architecture for SafeVoice

Based on the application's dummy data and TypeScript models, below is the complete recommended Supabase (PostgreSQL) database structure.

The design normalizes the data to standard relational database formats, replacing static string references with foreign keys where necessary, and separating user-specific interaction states (like "has voted" or "is saved") from the core entities.

## 1. `users` Table

Stores core user information. Guest users and regular users are differentiated by the `is_guest` flag.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  poll_votes_count INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 2. `topics` Table

Stores discussion threads and posts.

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_is_anonymous BOOLEAN DEFAULT false,
  media_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  has_poll BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: authorNickname is derived via JOIN with `users` table.
-- For anonymous posts, the client will display "Anonymous" or a generated anon ID.
```

## 3. `comments` Table

Stores hierarchical comments on topics.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_id TEXT, -- Generated identifier for anon users in a specific thread
  body TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. `polls` Table

Stores poll questions linked to specific topics.

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE UNIQUE,
  question TEXT NOT NULL,
  total_votes INTEGER DEFAULT 0,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. `poll_options` Table

Stores the selectable options for each poll.

```sql
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 6. `notifications` Table

Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'like_milestone', 'trending', 'report_resolved', 'new_poll')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Relational "State" Tables

The frontend models contain boolean/state fields (e.g., `userHasVoted`, `userVotedOptionId`, `isSaved`). In a normalized database, these are calculated by checking specific junction/relation tables for the current user.

### `user_poll_votes` Table

Tracks which option a user voted for in a poll.

```sql
CREATE TABLE user_poll_votes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, poll_id)
);
```

### `saved_topics` Table

Tracks topics bookmarked/saved by users.

```sql
CREATE TABLE saved_topics (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);
```

### `topic_reactions` Table

Tracks upvotes/downvotes on topics so users can only vote once.

```sql
CREATE TABLE topic_reactions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);
```

### `comment_reactions` Table

Tracks upvotes/downvotes on comments.

```sql
CREATE TABLE comment_reactions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);
```
