-- Direct SQL script to seed Ceremonia tenant and user
-- This bypasses the Payload API to avoid bootstrap issues

-- First, check if tables exist, if not create them
-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS payload_tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS payload_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  roles JSONB DEFAULT '["user"]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  enable_api_key BOOLEAN DEFAULT false,
  api_key VARCHAR(255),
  api_key_index VARCHAR(255),
  salt VARCHAR(255),
  hash VARCHAR(255),
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP
);

-- Create users_tenants relationship table if it doesn't exist
CREATE TABLE IF NOT EXISTS payload_users_rels (
  id SERIAL PRIMARY KEY,
  order INTEGER,
  parent_id INTEGER REFERENCES payload_users(id) ON DELETE CASCADE,
  path VARCHAR(255) NOT NULL,
  tenants_id INTEGER REFERENCES payload_tenants(id) ON DELETE CASCADE
);

-- Insert Ceremonia tenant (if not exists)
INSERT INTO payload_tenants (name, slug, domain, created_at, updated_at)
VALUES ('Ceremonia', 'ceremonia', 'ceremoniacircle.org', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Get the tenant ID
DO $$
DECLARE
  tenant_id INTEGER;
  user_id INTEGER;
BEGIN
  -- Get Ceremonia tenant ID
  SELECT id INTO tenant_id FROM payload_tenants WHERE slug = 'ceremonia';

  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM payload_users WHERE email = 'admin@ceremoniacircle.org') THEN
    -- Create Ceremonia user
    -- Note: Password is bcrypt hashed 'ceremonia_secure_password_123' with 10 rounds
    -- This is a placeholder - in production, use proper bcrypt hashing
    INSERT INTO payload_users (email, password, roles, created_at, updated_at)
    VALUES (
      'admin@ceremoniacircle.org',
      '$2a$10$rQ8YQXZLx.ZYH7SxqZ1.8ONvZqWZ5JQZlYXqWZQZqWZQZqWZQZqWZe', -- Placeholder hash
      '["user"]'::jsonb,
      NOW(),
      NOW()
    )
    RETURNING id INTO user_id;

    -- Create relationship between user and tenant
    INSERT INTO payload_users_rels (parent_id, path, tenants_id, "order")
    VALUES (user_id, 'tenants', tenant_id, 1);

    RAISE NOTICE 'Created Ceremonia user with ID: %', user_id;
  ELSE
    RAISE NOTICE 'Ceremonia user already exists';
  END IF;
END $$;

-- Verify the setup
SELECT
  u.id,
  u.email,
  u.roles,
  t.slug as tenant_slug
FROM payload_users u
LEFT JOIN payload_users_rels ur ON u.id = ur.parent_id
LEFT JOIN payload_tenants t ON ur.tenants_id = t.id
WHERE u.email = 'admin@ceremoniacircle.org';
