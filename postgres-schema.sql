CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  page_name TEXT,
  model_code TEXT,
  model_number INTEGER,
  description TEXT,
  city TEXT,
  duration TEXT,
  materials TEXT,
  price TEXT,
  cover_image TEXT,
  all_images TEXT,
  status TEXT DEFAULT 'منشور',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  reply TEXT,
  sender_type TEXT DEFAULT 'visitor',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  content TEXT,
  is_seen BOOLEAN DEFAULT FALSE,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  site_name TEXT DEFAULT 'الشام الذهبي',
  logo TEXT,
  favicon TEXT,
  phone TEXT,
  whatsapp TEXT,
  telegram TEXT,
  facebook TEXT,
  instagram TEXT,
  tiktok TEXT,
  x TEXT,
  email TEXT,
  city TEXT,
  color TEXT,
  visits INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bot_replies (
  id BIGSERIAL PRIMARY KEY,
  target_page TEXT DEFAULT 'general',
  trigger_keyword TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
