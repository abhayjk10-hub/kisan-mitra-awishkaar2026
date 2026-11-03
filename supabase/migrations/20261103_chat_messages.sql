CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save their own chat messages" ON chat_messages;
CREATE POLICY "Users can save their own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous visitors can save chat messages" ON chat_messages;
CREATE POLICY "Anonymous visitors can save chat messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
