-- ================================
--  USERS TABLE (for reference)
-- ================================
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
--  CONVERSATIONS TABLE
-- ================================
CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT FALSE,
  group_name VARCHAR(100),
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  last_message_id UUID,  -- reference to the most recent message
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
--  CONVERSATION PARTICIPANTS TABLE
-- ================================
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
);

-- ================================
--  MESSAGES TABLE
-- ================================
CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- ================================
--  FOREIGN KEY UPDATE: conversations.last_message_id
-- ================================
ALTER TABLE conversations
  ADD CONSTRAINT fk_last_message
  FOREIGN KEY (last_message_id) REFERENCES messages(message_id) ON DELETE SET NULL;

-- ================================
--  INDEXES (for performance)
-- ================================
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_updated_at ON conversations(updated_at);
