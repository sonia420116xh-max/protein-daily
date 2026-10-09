CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,1) NOT NULL DEFAULT 50,
  normal_target_g NUMERIC(5,1) NOT NULL DEFAULT 80,
  training_target_g NUMERIC(5,1) NOT NULL DEFAULT 85,
  training_days SMALLINT[] NOT NULL DEFAULT ARRAY[2,4,6],
  powder_serving_weight_g NUMERIC(5,1) NOT NULL DEFAULT 30,
  powder_protein_per_serving_g NUMERIC(5,1) NOT NULL DEFAULT 24,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,
  meal TEXT NOT NULL CHECK (meal IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  estimated_weight_g NUMERIC(7,1) NOT NULL,
  protein_per_100g NUMERIC(5,1) NOT NULL,
  protein_g NUMERIC(6,1) NOT NULL,
  weight_basis TEXT NOT NULL CHECK (weight_basis IN ('cooked','raw','bone-in','boneless')),
  source TEXT NOT NULL CHECK (source IN ('ai-estimate','manual','copied')),
  note TEXT,
  image_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX food_entries_user_date_idx ON food_entries(user_id, local_date);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
