-- SafeVoice Database Migration V2 (V2__fix_audit_logs_details_json.sql)
-- Alters audit_logs.details_json data type to JSONB for Hibernate JPA schema validation compatibility.

ALTER TABLE audit_logs ALTER COLUMN details_json TYPE JSONB USING details_json::jsonb;
