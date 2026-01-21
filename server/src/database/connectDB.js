import dotenv from 'dotenv';
import { pool } from './db_setup.js';

dotenv.config(); 

export const connectDB = async () => {
  console.log("Connecting to database... 🔃");

  try {
    const client = await pool.connect();
    console.log("Database connected successfully ✅");
    client.release();
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    process.exit(1); // stop app if DB connection fails
  }
};
