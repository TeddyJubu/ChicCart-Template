-- Database initialization script
-- This runs when the PostgreSQL container starts for the first time

-- Create the sessions table for express-session storage
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Set proper permissions
GRANT ALL PRIVILEGES ON TABLE sessions TO ecommerce;