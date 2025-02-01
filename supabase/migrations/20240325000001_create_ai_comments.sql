-- AIコメントテーブルの作成
CREATE TABLE ai_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id UUID REFERENCES diaries(id) ON DELETE CASCADE NOT NULL,
  ai_name VARCHAR(255) NOT NULL,
  ai_avatar VARCHAR(255) NOT NULL,
  ai_role VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE ai_comments ENABLE ROW LEVEL SECURITY;

-- 自分の日記に紐づくAIコメントのみ参照可能
CREATE POLICY "Users can view their own diary's AI comments" 
  ON ai_comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM diaries 
      WHERE diaries.id = ai_comments.diary_id 
      AND diaries.user_id = auth.uid()
    )
  );

-- 自分の日記に対してのみAIコメントを作成可能
CREATE POLICY "Users can create AI comments for their own diaries" 
  ON ai_comments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diaries 
      WHERE diaries.id = ai_comments.diary_id 
      AND diaries.user_id = auth.uid()
    )
  ); 
