# 📚 ReadCycle – Peer-to-Peer Book Exchange Platform

> A modern web platform that enables students to **exchange, lend, or sell used books** directly with one another — saving money, promoting sustainability, and encouraging a culture of reuse.

---

## 🚀 Overview

Many students purchase new textbooks while older ones remain unused. **ReadCycle** solves this problem by providing a **peer-to-peer (P2P) marketplace** where students can list their books for sale, exchange, or lending.

Built with simplicity, security, and accessibility in mind, ReadCycle helps students connect easily, save costs, and contribute to a greener environment.

---

## 🧩 Features

✅ **User Authentication** – Sign up, log in, and manage your profile securely
✅ **Book Management** – Add, edit, and remove book listings with images and descriptions
✅ **Search and Filter** – Find books by title, author, or course
✅ **Direct Messaging** – Chat with other users in real-time to negotiate deals
✅ **Exchange System** – Record and manage book swaps between users
✅ **Responsive UI** – Works seamlessly across desktops, tablets, and mobile devices

---

## 🛠️ Tech Stack

| Layer                   | Technology                             |
| ----------------------- | -------------------------------------- |
| **Frontend**            | React.js + TailwindCSS                 |
| **Backend**             | Node.js + Express.js                   |
| **Database**            | PostgreSQL (or SQLite for development) |
| **Authentication**      | JSON Web Tokens (JWT) + bcrypt         |
| **Real-Time Messaging** | Socket.io                              |
| **Version Control**     | Git & GitHub                           |

---

## 🧱 System Architecture

```

[ Client (React) ]  ⇄  [ Server (Node/Express) ]  ⇄  [ Database (PostgreSQL) ]

```

---

## 🗂️ Folder Structure

```

ReadCycle/
│
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page views (Home, Login, Dashboard)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── assets/          # Images and icons
│   │   └── App.jsx
│   └── package.json
│
├── server/                  # Express Backend
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── models/              # Database schemas
│   ├── middleware/          # Auth & validation
│   ├── config/              # DB connection & environment
│   └── server.js
│
├── README.md
├── .env.example
├── package.json
└── LICENSE

```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/readcycle.git
cd readcycle
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables:
# DATABASE_URL, JWT_SECRET, PORT, etc.
npm run dev
```

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

### 4️⃣ Access the App

Visit **[http://localhost:5173](http://localhost:5173)** (or the port shown in your terminal).

---

## 🔐 Security Features

- Passwords hashed with **bcrypt**
- JWT-based authentication
- Input validation with **express-validator**
- HTTPS-ready configuration for deployment

---

## 🎨 UI/UX Design

Color Palette (from style guide):

- `#4A90E2` – Primary Blue
- `#2C3E50` – Deep Navy for headers
- `#ECF0F1` – Light Gray background
- `#27AE60` – Success/confirmation actions
- `#E74C3C` – Alerts and errors

Typography:

- **Primary Font:** Nunito Sans
- **Secondary Font:** Inter

---

## 🧪 Testing

Unit and integration testing can be added using:

- **Jest** (for backend logic)
- **React Testing Library** (for frontend UI components)

To run tests:

```bash
npm run test
```

---

## 💡 Future Improvements

- Implement book delivery tracking
- Add ratings and reviews for users
- Integrate AI-powered book recommendations
- Support for institutional logins (e.g., university email verification)

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Added new feature"`)
4. Push and open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify with attribution.

---

## 👨‍💻 Author

**Hassy**
Final Year Student – Software Engineering

Project Title: _ReadCycle – A Peer-to-Peer Book Exchange Platform_
[GitHub](https://github.com/yourusername) • [LinkedIn](#)

---

> “Don’t buy new when someone has one waiting to be read — join the ReadCycle.”
