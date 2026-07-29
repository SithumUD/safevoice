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
