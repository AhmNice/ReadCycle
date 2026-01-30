import { pool } from "../database/db_setup.js";

export class Book {
  constructor({
    book_title,
    book_author,
    book_owner,
    book_to = null,
    book_swap_with,
    book_for,
    book_condition,
    book_price,
    book_location,
    book_cover,
    book_rental_period,
    book_description,
    book_course,
    book_status = 'active',
  }) {
    this.book_author = book_author;
    this.book_title = book_title;
    this.book_owner = book_owner;
    this.book_for = book_for;
    this.book_location = book_location;
    this.book_price = book_price;
    this.book_to = book_to;
    this.book_swap_with = book_swap_with;
    this.book_condition = book_condition;
    this.book_cover = book_cover;
    this.book_rental_period = book_rental_period;
    this.book_description = book_description
    this.book_course =book_course
    this.book_status = book_status
  }

  //  Save a new book to the DB
  //  Save a new book to the DB
  async save() {
    try {
      let query;
      let values;

      if (this.book_for === "swap") {
        // 🔁 Include book_swap_with if book is for swap
        query = `
        INSERT INTO books
          (book_title, book_author, book_owner, book_price, book_for, book_condition, book_location, book_cover, book_swap_with,book_description,book_course,book_status)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11, $12)
        RETURNING *;
      `;
        values = [
          this.book_title,
          this.book_author,
          this.book_owner,
          this.book_price,
          this.book_for,
          this.book_condition,
          this.book_location,
          this.book_cover,
          this.book_swap_with,
          this.book_description,
          this.book_course,
          this.book_status
        ];
      } else if (this.book_for === "rent") {
        query = `
    INSERT INTO books
      (book_title, book_author, book_owner, book_price, book_for, book_condition, book_location, book_cover, book_swap_with, book_rental_period,book_description,book_course, book_status)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13)
    RETURNING *;
  `;
        values = [
          this.book_title,
          this.book_author,
          this.book_owner,
          this.book_price,
          this.book_for,
          this.book_condition,
          this.book_location,
          this.book_cover,
          this.book_swap_with,
          this.book_rental_period,
          this.book_description,
          this.book_course,
          this.book_status
        ];
      } else {
        // 🪶 Regular insert (no swap info)
        query = `
        INSERT INTO books
          (book_title, book_author, book_owner, book_price, book_for, book_condition, book_location, book_cover,book_description,book_course, book_status)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11)
        RETURNING *;
      `;
        values = [
          this.book_title,
          this.book_author,
          this.book_owner,
          this.book_price,
          this.book_for,
          this.book_condition,
          this.book_location,
          this.book_cover,
          this.book_description,
          this.book_course,
          this.book_status
        ];
      }

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error saving book:", error.message);
      throw error;
    }
  }

  //  static method to fetch books
  static async fetchBooks() {
    try {
      const results = await pool.query(`SELECT * FROM books`);
      return results.rows; // Return the rows (actual data)
    } catch (error) {
      console.error("❌ Error fetching books:", error.message);
      throw error;
    }
  }
  //  static method to fetch single user books
  static async fetchUserBook(user_id) {
    try {
      const results = await pool.query(
        `SELECT * FROM books WHERE book_owner = $1`,
        [user_id]
      );
      return results.rows || [];
    } catch (error) {
      console.error("❌ Error fetching books:", error.message);
      throw error;
    }
  }
  //  Static method to find a book by any of many fields
  static async find({ id, author, title, user }) {
    try {
      const conditions = [];
      const values = [];
      let index = 1;

      if (id !== undefined) {
        conditions.push(`book_id = $${index++}`);
        values.push(id);
      }
      if (author !== undefined) {
        conditions.push(`book_author = $${index++}`);
        values.push(author);
      }
      if (title !== undefined) {
        conditions.push(`book_title = $${index++}`);
        values.push(title);
      }
      if (user !== undefined) {
        conditions.push(`book_owner = $${index++}`);
        values.push(user);
      }

      if (conditions.length === 0) return null;

      const query = `
      SELECT *
      FROM books
      WHERE ${conditions.join(" OR ")}
      LIMIT 1;
    `;

      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("❌ Error finding books:", error.message);
      throw error;
    }
  }
  //  Find book by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM books WHERE book_id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.log("Error finding book by id: ", error.message);
      throw error;
    }
  }
  //  Find all books by a given author
  static async findByAuthor(author) {
    try {
      const result = await pool.query(
        `SELECT * FROM books WHERE book_author = $1`,
        [author]
      );
      return result.rows || [];
    } catch (error) {
      console.log("Error finding book by author: ", error.message);
      throw error;
    }
  }
  //    update book by id
  static async updateById(id, updates) {
  try {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in updates) {
      fields.push(`${key} = $${index++}`);
      values.push(updates[key]);
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE books
      SET ${fields.join(", ")}
      WHERE book_id = $${index}
      RETURNING *;
    `;

    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    console.error("❌ Error updating book:", error.message);
    throw error;
  }
}


  static async delete(id) {
  try {
    const result = await pool.query(
      `UPDATE books SET book_status = 'deleted' WHERE book_id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error deleting book:", error.message);
    throw error;
  }
}


}
