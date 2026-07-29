-- Supabase Database Architecture for SafeVoice

-- 1. `users` Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  poll_votes_count INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a user profile in public.users when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, nickname, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'nickname',
    NEW.raw_user_meta_data ->> 'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. `topics` Table
CREATE TABLE IF NOT EXISTS topics (
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

-- 3. `comments` Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_id TEXT,
  body TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. `polls` Table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE UNIQUE,
  question TEXT NOT NULL,
  total_votes INTEGER DEFAULT 0,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. `poll_options` Table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. `notifications` Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'like_milestone', 'trending', 'report_resolved', 'new_poll')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relational "State" Tables

-- `user_poll_votes` Table
CREATE TABLE IF NOT EXISTS user_poll_votes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, poll_id)
);

-- `saved_topics` Table
CREATE TABLE IF NOT EXISTS saved_topics (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- `topic_reactions` Table
CREATE TABLE IF NOT EXISTS topic_reactions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- `comment_reactions` Table
CREATE TABLE IF NOT EXISTS comment_reactions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);
