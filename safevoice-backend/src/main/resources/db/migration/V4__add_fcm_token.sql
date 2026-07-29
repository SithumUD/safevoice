-- SafeVoice Database Migration V4 (V4__add_fcm_token.sql)
-- Adds fcm_token column to users table for push notification support.

ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
