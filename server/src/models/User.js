import bcryptjs from "bcryptjs";
import { pool } from "../database/db_setup.js";

export class User {
  constructor({
    full_name,
    email,
    password,
    university,
    major,
    verification_token,
    verification_token_expires_at,
  }) {
    this.full_name = full_name;
    this.email = email;
    this.password = password;
    this.university = university;
    this.major = major;
    this.verification_token = verification_token;
    this.verification_token_expires_at = verification_token_expires_at;
  }

  // ✅ Save a new user to DB
  async save() {
    const password_hash = await bcryptjs.hash(this.password, 10);
    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, university, major, password_hash,verification_token,verification_token_expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, full_name, email, university, major
      `,
      [
        this.full_name,
        this.email,
        this.university,
        this.major,
        password_hash,
        this.verification_token,
        this.verification_token_expires_at,
      ]
    );
    return result.rows[0];
  }
  // ✅ Static method to find user by email
  static async findByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0] || null;
  }
  // ✅ static method to find user by id
  static async findById(user_id) {
    try {
      const result = await pool.query(
        `SELECT full_name, avatar FROM users WHERE user_id = $1`,
        [user_id]
      );

      // ✅ Return the first row or null if not found
      return result.rows[0] || null;
    } catch (error) {
      console.error("❌ Error finding user by ID:", error.message);
      throw error;
    }
  }
  // static method to update many fields
  static async updateUserById({
    user_id,
    firstName,
    lastName,
    email,
    password,
    university,
    major,
    phone_number,
    bio,
  }) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Collect only fields provided (avoid overwriting with null)
      if (email) {
        fields.push(`email = $${index++}`);
        values.push(email);
      }
      if (password) {
        fields.push(`password_hash = $${index++}`);
        values.push(password);
      }
      if (university) {
        fields.push(`university = $${index++}`);
        values.push(university);
      }
      if (major) {
        fields.push(`major = $${index++}`);
        values.push(major);
      }
      if (phone_number) {
        fields.push(`phone_number = $${index++}`);
        values.push(phone_number);
      }
      if (bio) {
        fields.push(`bio = $${index++}`);
        values.push(bio);
      }
      if (firstName) {
        fields.push(`firstName = $${index++}`);
        values.push(firstName);
      }
      if (lastName) {
        fields.push(`lastName = $${index++}`);
        values.push(lastName);
      }

      // If no field was provided
      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      // Add the user_id at the end
      values.push(user_id);

      const query = `
      UPDATE users
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE user_id = $${index}
      RETURNING *;
    `;

      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("❌ Error updating user:", error.message);
      throw error;
    }
  }
  // static method to verify user
  static async verifyUser({ email, otp }) {
    try {
      const user = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND verification_token = $2`,
        [email, otp]
      );
      console.log("email: ", email, "otp: ", otp);
      if (user.rows.length === 0) {
        throw Error("Invalid email address or OTP provided");
      }

      const userData = user.rows[0];

      const isExpired =
        Date.now() > new Date(userData.verification_token_expires_at);

      if (isExpired) {
        throw Error("OTP expired");
      }

      const updatedUser = await pool.query(
        `UPDATE users 
       SET isVerified =$1, verification_token = $2,  verification_token_expires_at = $3 
       WHERE email = $4 RETURNING *`,
        [true, null, null, email]
      );

      const { password_hash, ...rest } = updatedUser.rows[0];
      return rest;
    } catch (error) {
      console.log("Error updating verification: ", error.message);
      throw error;
    }
  }
  static async markUserOnline(email) {
  try {
    const result = await pool.query(
      `UPDATE users SET is_online = $1 WHERE email = $2 RETURNING *`,
      [true, email]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const { password_hash, ...user } = result.rows[0];
    return user;
  } catch (error) {
    console.log("Error marking user online:", error.message);
    throw error;
  }
}
  static async markUserOffline(email) {
  try {
    const result = await pool.query(
      `UPDATE users SET is_online = $1 WHERE email = $2 RETURNING *`,
      [false, email]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const { password_hash, ...user } = result.rows[0];
    return user;
  } catch (error) {
    console.log("Error marking user online:", error.message);
    throw error;
  }
}
  
}
