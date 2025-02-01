-- diariesテーブルの作成
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(255) NOT NULL,
  ai_review_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 自分の日記のみ参照可能
CREATE POLICY "Users can view their own diaries" 
  ON diaries FOR SELECT 
  USING (auth.uid() = user_id);

-- 自分の日記のみ作成可能
CREATE POLICY "Users can create their own diaries" 
  ON diaries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 自分の日記のみ更新可能
CREATE POLICY "Users can update their own diaries" 
  ON diaries FOR UPDATE 
  USING (auth.uid() = user_id);

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_diaries_updated_at
    BEFORE UPDATE ON diaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
