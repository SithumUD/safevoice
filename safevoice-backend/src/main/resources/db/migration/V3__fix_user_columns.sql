-- SafeVoice Database Migration V3 (V3__fix_user_columns.sql)
-- Adds missing engagement columns to users table for Hibernate JPA entity compatibility.

ALTER TABLE users ADD COLUMN IF NOT EXISTS likes_received INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
