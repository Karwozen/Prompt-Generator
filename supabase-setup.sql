-- 1. Create the knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  content text,
  url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the brand_assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand_assets', 'brand_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage policies for public access (optional, depending on your needs. Here we allow public reads)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'brand_assets' );

-- 4. Set up Storage policies for authenticated/anon uploads (Modify according to your auth logic. Here we allow anon for simplicity in development)
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'brand_assets' );

-- 5. Set up policies for the knowledge_base table (Allow all for development)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for knowledge_base" ON knowledge_base
  FOR ALL USING (true) WITH CHECK (true);
