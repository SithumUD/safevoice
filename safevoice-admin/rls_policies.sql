-- ==========================================
-- SafeVoice Row Level Security (RLS) Policies
-- ==========================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- 2. Create helper function for admin checks
-- Drops the function if it exists to allow for clean re-runs
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ==========================================
-- 3. USERS TABLE POLICIES
-- ==========================================
-- Anyone can view profiles (needed to render avatars/nicknames on posts)
CREATE POLICY "Public read access for users" ON users FOR SELECT USING (true);

-- Users can edit their own profiles
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- No INSERT or DELETE policies needed for public here since the trigger `on_auth_user_created` handles insertion using a security definer, and deletion is typically handled via Supabase Auth cascade.


-- ==========================================
-- 4. TOPICS TABLE POLICIES
-- ==========================================
-- Anyone can view topics
CREATE POLICY "Public read access for topics" ON topics FOR SELECT USING (true);

-- ONLY Admins can manage (insert/update/delete) topics
CREATE POLICY "Admins can insert topics" ON topics FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update topics" ON topics FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete topics" ON topics FOR DELETE USING (public.is_admin());


-- ==========================================
-- 5. COMMENTS TABLE POLICIES
-- ==========================================
-- Anyone can view comments
CREATE POLICY "Public read access for comments" ON comments FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can manage their OWN comments, and Admins can delete ANY comment
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete any comment" ON comments FOR DELETE USING (public.is_admin());


-- ==========================================
-- 6. POLLS & POLL_OPTIONS POLICIES
-- ==========================================
-- Anyone can view polls and options
CREATE POLICY "Public read access for polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Public read access for poll options" ON poll_options FOR SELECT USING (true);

-- Only Admins can manage polls (since only admins can create topics, only they attach polls)
CREATE POLICY "Admins can insert polls" ON polls FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update polls" ON polls FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete polls" ON polls FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can insert poll options" ON poll_options FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update poll options" ON poll_options FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete poll options" ON poll_options FOR DELETE USING (public.is_admin());


-- ==========================================
-- 7. NOTIFICATIONS POLICIES
-- ==========================================
-- Users can only read and manage their own notifications
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 8. INTERACTION TABLES POLICIES (Reactions, Votes, Saves)
-- ==========================================
-- Anyone can read interaction counts/data to calculate totals
CREATE POLICY "Public read access for topic reactions" ON topic_reactions FOR SELECT USING (true);
CREATE POLICY "Public read access for comment reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Public read access for poll votes" ON user_poll_votes FOR SELECT USING (true);
CREATE POLICY "Public read access for saved topics" ON saved_topics FOR SELECT USING (true);

-- Users can only insert/update/delete their own interactions
-- Topic Reactions
CREATE POLICY "Users can manage own topic reactions" ON topic_reactions FOR ALL USING (auth.uid() = user_id);

-- Comment Reactions
CREATE POLICY "Users can manage own comment reactions" ON comment_reactions FOR ALL USING (auth.uid() = user_id);

-- Poll Votes
CREATE POLICY "Users can manage own poll votes" ON user_poll_votes FOR ALL USING (auth.uid() = user_id);

-- Saved Topics
CREATE POLICY "Users can manage own saved topics" ON saved_topics FOR ALL USING (auth.uid() = user_id);
