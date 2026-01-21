import cloudinary from "../config/cloudinary.config.js";
import { Book } from "../models/Book.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import handleInputValidation from "../util/handleInputValidation.js";
import fs from "fs";
export const createBook = async (req, res) => {
  if (!handleInputValidation(req, res)) return;

  const {
    book_title,
    book_author,
    book_owner,
    book_to,
    book_swap_with,
    book_price,
    book_rental_period,
    book_condition,
    book_for,
    book_location,
    book_description,
    book_course,
  } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a book cover image",
      });
    }

    //  Upload book cover to Cloudinary
    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const dataUri = `data:${mimeType};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "HASSY/readcycle/books",
      public_id: `${book_title}-${book_owner}-${Date.now()}`,
    });

    //  Save new book
    const newBook = new Book({
      book_title,
      book_author,
      book_owner,
      book_for,
      book_condition,
      book_to,
      book_swap_with,
      book_price,
      book_location,
      book_rental_period,
      book_cover: result.secure_url,
      book_description,
      book_course,
    });

    const savedBook = await newBook.save();

    //  Remove uploaded file from local storage
    fs.unlinkSync(req.file.path);

    //  Create notification for the book owner
    const notification = new Notification({
      user_id: book_owner,
      title: "New Book Listed",
      message: `You added "${book_title}" to your ReadCycle listings.`,
    });
    await notification.save();

    return res.status(201).json({
      success: true,
      message: "New book added successfully",
      book: savedBook,
    });
  } catch (error) {
    console.error("❌ Error creating book:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating book",
      error: error.message,
    });
  }
};

export const fetchBooks = async (req, res) => {
  if (!handleInputValidation(req, res)) return;

  try {
    // 1️⃣ Get all books
    const result = await Book.fetchBooks();

    // 2️⃣ Enrich each book with its owner's info
    const books = await Promise.all(
      result.map(async (book) => {
        const owner = await User.findById(book.book_owner);

        return {
          id: book.book_id,
          title: book.book_title,
          author: book.book_author,
          course: book.book_course,
          price: book.book_price,
          condition: book.book_condition,
          description: book.book_description,
          location: book.book_location,
          swap: book.book_swap_with,
          image: book.book_cover || null,
          seller: {
            name: owner?.full_name || "Unknown Seller",
            avatar: owner?.avatar,
            user_id: book.book_owner || null,
          },
          listingType: book.book_for,
          postedDate: book.created_at,
        };
      })
    );

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      message: "All books fetched successfully",
      books,
    });
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching books",
    });
  }
};
export const userBooks = async (req, res) => {
  if (!handleInputValidation(req, res)) return;
  const { id } = req.params;
  try {
    const userBooks = await Book.fetchUserBook(id);
    res.status(200).json({
      success: true,
      message: "All user books fetched",
      userBooks: userBooks,
    });
  } catch (error) {
    console.error("❌ Error fetching user books:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
