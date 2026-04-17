-- ChamaConnect D1 Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otps (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otps_email_code ON otps(email, code);

CREATE TABLE IF NOT EXISTS chamas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'KES',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chama_id TEXT NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK(role IN ('ADMIN', 'TREASURER', 'MEMBER')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, chama_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_chama ON memberships(chama_id);

CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  chama_id TEXT NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK(role IN ('ADMIN', 'TREASURER', 'MEMBER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
  token TEXT UNIQUE NOT NULL,
  sent_by_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email_chama ON invites(email, chama_id);

CREATE TABLE IF NOT EXISTS contribution_plans (
  id TEXT PRIMARY KEY,
  chama_id TEXT NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_plans_chama ON contribution_plans(chama_id);

CREATE TABLE IF NOT EXISTS contribution_records (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES contribution_plans(id) ON DELETE CASCADE,
  membership_id TEXT NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL DEFAULT 0,
  expected_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK(status IN ('UPCOMING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE')),
  due_date TEXT NOT NULL,
  paid_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_records_plan ON contribution_records(plan_id);
CREATE INDEX IF NOT EXISTS idx_records_membership ON contribution_records(membership_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON contribution_records(status);
CREATE INDEX IF NOT EXISTS idx_records_due_date ON contribution_records(due_date);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  contribution_record_id TEXT NOT NULL REFERENCES contribution_records(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SUCCESS', 'FAILED')),
  provider TEXT NOT NULL DEFAULT 'paystack',
  provider_reference TEXT,
  provider_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(provider_reference);
CREATE INDEX IF NOT EXISTS idx_payments_record ON payments(contribution_record_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  chama_id TEXT REFERENCES chamas(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_chama ON audit_logs(chama_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
