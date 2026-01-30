import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const db_name = process.env.DB_NAME || "readcycle_db";

const dbConfig_default = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  database: "postgres",
};

// ✅ Pool to the actual project database
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  database: db_name,
});

// ✅ Default connection (to create DB if not exists)
const defaultPool = new Pool(dbConfig_default);

const createDatabase = async () => {
  try {
    const checkQuery = "SELECT 1 FROM pg_database WHERE datname = $1";
    const checkResult = await defaultPool.query(checkQuery, [db_name]);

    if (checkResult.rowCount === 0) {
      await defaultPool.query(`CREATE DATABASE "${db_name}"`);
      console.log(`✅ Database "${db_name}" created successfully`);
    } else {
      console.log(`ℹ️ Database "${db_name}" already exists.`);
    }
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
  } finally {
    await defaultPool.end();
  }
};

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Required extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "citext";`);

    // USERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(225) NOT NULL,
        email CITEXT UNIQUE NOT NULL,
        avatar TEXT,
        is_online BOOLEAN DEFAULT FALSE,
        university VARCHAR(225) NOT NULL,
        major VARCHAR(50) NOT NULL,
        phone_number VARCHAR(20),
        bio TEXT,
        password_hash TEXT,
        isVerified BOOLEAN DEFAULT FALSE,
        forget_password_token TEXT,
        forget_password_token_expires_at TIMESTAMP,
        verification_token VARCHAR(20),
        verification_token_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // CONVERSATIONS
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        is_group BOOLEAN DEFAULT FALSE,
        group_name VARCHAR(100),
        created_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // MESSAGES
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add last message reference
    await client.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS last_message_id UUID
      REFERENCES messages(message_id) ON DELETE SET NULL;
    `);

    // PARTICIPANTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        is_admin BOOLEAN DEFAULT FALSE,
        last_seen_at TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `);

    // BOOKS
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        book_title VARCHAR(100) NOT NULL,
        book_author VARCHAR(100) NOT NULL,
        book_owner UUID REFERENCES users(user_id) ON DELETE CASCADE,
        book_for VARCHAR(20) NOT NULL CHECK (book_for IN ('swap','sale','rent')),
        book_to UUID REFERENCES users(user_id) ON DELETE CASCADE,
        book_price DECIMAL DEFAULT 0.0,
        book_location VARCHAR(220) NOT NULL,
        book_condition VARCHAR(220) NOT NULL,
        book_description TEXT,
        book_course VARCHAR(225),
        book_cover TEXT,
        book_swap_with VARCHAR(225) DEFAULT NULL,
        book_rental_period VARCHAR(225),
        book_status VARCHAR(20) NOT NULL CHECK (book_status IN ('active', 'sold', 'swap','rented')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // NOTIFICATIONS
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        type VARCHAR(40),
        title VARCHAR(100),
        priority VARCHAR(10) DEFAULT 'normal',
        action_performed VARCHAR(150),
        body TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        for_all BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // INDEXES
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_books_owner ON books(book_owner);`);

    await client.query("COMMIT");
    console.log("✅ All tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating tables:", error.message);
  } finally {
    client.release();
  }
};

const set_db_up = async () => {
  await createDatabase();
  await createTables();
};

export default set_db_up;
