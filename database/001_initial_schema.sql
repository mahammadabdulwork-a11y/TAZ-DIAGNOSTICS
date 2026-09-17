-- TAZ COMPANY / TAZ DIAGNOSTIC
-- Initial database foundation

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(30) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  specialization VARCHAR(120),
  registration_no VARCHAR(80),
  phone VARCHAR(30),
  email VARCHAR(160),
  signature_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  patient_code VARCHAR(40) UNIQUE NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  date_of_birth DATE,
  age INTEGER,
  gender VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(160),
  address TEXT,
  branch_id INTEGER REFERENCES branches(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES test_categories(id),
  name VARCHAR(180) NOT NULL,
  short_name VARCHAR(80),
  unit VARCHAR(50),
  male_reference_range VARCHAR(120),
  female_reference_range VARCHAR(120),
  child_reference_range VARCHAR(120),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  report_code VARCHAR(50) UNIQUE NOT NULL,
  patient_id BIGINT NOT NULL REFERENCES patients(id),
  branch_id INTEGER REFERENCES branches(id),
  sample_id VARCHAR(60),
  sample_type VARCHAR(80),
  collection_at TIMESTAMPTZ,
  report_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_doctors (
  report_id BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id),
  PRIMARY KEY (report_id, doctor_id)
);

CREATE TABLE IF NOT EXISTS report_items (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id),
  result_value VARCHAR(120),
  status VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id),
  report_id BIGINT REFERENCES reports(id),
  channel VARCHAR(30),
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id),
  report_id BIGINT REFERENCES reports(id),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
