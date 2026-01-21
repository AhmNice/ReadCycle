import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/database/connectDB.js";
import router, { book_router, chatsRouter, notification_route } from "./src/routes/routes.js";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./src/chats/socket.io_setup.js";

dotenv.config();

const app = express();
const socket_io_server = http.createServer(app);
initSocket(socket_io_server);

const PORT = process.env.PORT;

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/auth", router);
app.use("/books", book_router);
app.use("/chats", chatsRouter);
app.use("/notification", notification_route);

const startServer = async () => {
  console.log("connecting to server.... 🔃");
  try {
    await connectDB();

    socket_io_server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.log("❌ Error trying to connect to server: ", error.message);
  }
};

startServer();
