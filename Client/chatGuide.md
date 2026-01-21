# 💬 Chat System Database Design & API Guide

## 🗂️ Tables Overview

Your chat system needs two main tables:

- **conversations** — stores info about each chat thread (1-to-1 or group)
- **messages** — stores individual messages in a conversation

---

## 🧱 Table: `conversations`

| Field               | Type                      | Description                                               |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| **conversation_id** | `UUID` (Primary Key)      | Unique ID for the conversation                            |
| **is_group**        | `BOOLEAN`                 | Whether this conversation is a group chat or private chat |
| **group_name**      | `VARCHAR(100)`            | Optional group name (null for 1-to-1 chat)                |
| **created_by**      | `UUID`                    | User ID of the person who created the chat                |
| **last_message_id** | `UUID`                    | Foreign key referencing last message                      |
| **updated_at**      | `TIMESTAMP`               | Updated each time a new message is added                  |
| **created_at**      | `TIMESTAMP DEFAULT NOW()` | When the chat was created                                 |

### 🧩 Join Table: `conversation_participants`

| Field               | Type        | Description                         |
| ------------------- | ----------- | ----------------------------------- |
| **conversation_id** | `UUID`      | FK to `conversations`               |
| **user_id**         | `UUID`      | FK to `users`                       |
| **is_admin**        | `BOOLEAN`   | Whether this user is admin of group |
| **last_seen_at**    | `TIMESTAMP` | For tracking unread messages        |

---

## 📨 Table: `messages`

| Field               | Type                                | Description               |
| ------------------- | ----------------------------------- | ------------------------- |
| **message_id**      | `UUID` (Primary Key)                | Unique message ID         |
| **conversation_id** | `UUID`                              | FK to `conversations`     |
| **sender_id**       | `UUID`                              | FK to `users`             |
| **body**            | `TEXT`                              | Message content           |
| **status**          | `ENUM('sent', 'delivered', 'read')` | Message delivery status   |
| **created_at**      | `TIMESTAMP DEFAULT NOW()`           | When the message was sent |
| **updated_at**      | `TIMESTAMP`                         | When message was edited   |

---

## 🧭 Relationships

```
conversations
  ├── conversation_participants
  │      ├── users (many-to-one)
  │
  └── messages (one-to-many)
         ├── sender (users)
```

---

## ⚙️ Example Queries

### 🧑‍🤝‍🧑 Fetch All Conversations for a User

```sql
SELECT
  c.conversation_id,
  c.is_group,
  c.group_name,
  c.updated_at,
  m.body AS last_message,
  m.created_at AS last_message_time,
  u.user_id,
  u.full_name AS sender_name,
  u.avatar
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.conversation_id
LEFT JOIN messages m ON m.message_id = c.last_message_id
LEFT JOIN users u ON u.user_id = m.sender_id
WHERE cp.user_id = $1
ORDER BY c.updated_at DESC;
```

### 🗨️ Fetch All Messages in a Conversation

```sql
SELECT
  m.message_id,
  m.conversation_id,
  m.sender_id,
  u.full_name AS sender_name,
  u.avatar,
  m.body,
  m.status,
  m.created_at
FROM messages m
JOIN users u ON u.user_id = m.sender_id
WHERE m.conversation_id = $1
ORDER BY m.created_at ASC;
```

---

## ⚡ Example Backend (Node/Express + PostgreSQL)

### Get User’s Conversations

```js
app.get("/api/conversations", async (req, res) => {
  const userId = req.user.id;
  const { rows } = await pool.query(
    `SELECT c.*, m.body AS last_message, m.created_at AS last_message_time
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.conversation_id
     LEFT JOIN messages m ON m.message_id = c.last_message_id
     WHERE cp.user_id = $1
     ORDER BY c.updated_at DESC`,
    [userId]
  );
  res.json(rows);
});
```

### Get Messages in Conversation

```js
app.get("/api/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT m.*, u.full_name AS sender_name, u.avatar
     FROM messages m
     JOIN users u ON u.user_id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC`,
    [id]
  );
  res.json(rows);
});
```

---

## 📤 Expected API Responses

### **GET /api/conversations**

```json
[
  {
    "conversation_id": "c1a2b3",
    "is_group": false,
    "group_name": null,
    "updated_at": "2025-10-15T11:48:21.000Z",
    "last_message": "Hey 👋 just checking in about the SmartAgro project.",
    "last_message_time": "2025-10-15T11:40:00.000Z",
    "sender_name": "Tunde Okoro",
    "avatar": "tunde.jpg"
  },
  {
    "conversation_id": "c5x9z8",
    "is_group": true,
    "group_name": "SmartAgro Devs",
    "updated_at": "2025-10-15T11:52:01.000Z",
    "last_message": "The TensorFlow model just finished training.",
    "last_message_time": "2025-10-15T11:50:00.000Z",
    "sender_name": "Aisha Bello",
    "avatar": "aisha.png"
  }
]
```

---

### **GET /api/conversations/:id/messages**

```json
[
  {
    "message_id": "m101",
    "conversation_id": "c1a2b3",
    "sender_id": "u101",
    "sender_name": "Aisha Bello",
    "avatar": "aisha.png",
    "body": "Hey 👋 just checking in about the SmartAgro project.",
    "status": "read",
    "created_at": "2025-10-15T11:40:00.000Z"
  },
  {
    "message_id": "m102",
    "conversation_id": "c1a2b3",
    "sender_id": "u202",
    "sender_name": "Tunde Okoro",
    "avatar": "tunde.jpg",
    "body": "All good! The dashboard is almost ready ✅",
    "status": "sent",
    "created_at": "2025-10-15T11:42:00.000Z"
  }
]
```

---

## 🧠 Notes & Best Practices

- Always **index** `conversation_id` and `sender_id` for performance.
- Use **WebSockets (Socket.io)** for real-time message updates.
- Track **last_seen_at** in `conversation_participants` for unread counts.
- Update `last_message_id` and `updated_at` in `conversations` after each new message.
