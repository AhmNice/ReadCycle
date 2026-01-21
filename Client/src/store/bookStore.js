import { create } from "zustand";
import axios from "axios";
axios.defaults.withCredentials = true;

const initialState = {
  books: [],
  userBooks: [],
  loadingBooks: false,
  booksError: null,
  bookSuccess: false,
};
const booksEndpoint = import.meta.env.VITE_BOOKS_ENDPOINT;
export const useBookStore = create((set, get) => ({
  ...initialState,
  createBook: async (payload) => {
    set({ loadingBooks: true, booksError: null, bookSuccess: null });
    try {
      const { data } = await axios.post(
        `${booksEndpoint}/create-book`,
        payload
      );
      set({
        loadingBooks: false,
        books: [...get().books, data.book],
        bookSuccess: true,
        booksError: null,
      });
      return { success: true, message: data.message };
    } catch (error) {
      console.log("error adding book: ", error.message);
      set({
        loadingBooks: false,
        bookSuccess: false,
        booksError: error?.response?.data.message || error.message,
      });
      return { success: false, message: error?.response?.data.message || error?.response?.data.message };
    } finally {
      set({ loadingBooks: false });
    }
  },
  fetchBooks: async (force = false) => {
    const { books } = get();

    // ✅ Check if books are already loaded
    if (books?.length > 0 && !force) return;

    set({ loadingBooks: true, booksError: null, bookSuccess: null });

    try {
      const { data } = await axios.get(`${booksEndpoint}/fetch-books`);

      set({
        loadingBooks: false,
        books: data.books || [],
        bookSuccess: data.message || "Books fetched successfully",
      });

      return { success: true, message: "Books fetched successfully" };
    } catch (error) {
      console.error("❌ Error fetching books:", error);

      set({
        loadingBooks: false,
        booksError: error.response?.data?.message || "Failed to fetch books",
      });

      return { success: false, message: "Failed to fetch books" };
    }
  },
  fetchUserBooks: async (force = false, user_id) => {
    const { books } = get();

    // ✅ Check if books are already loaded
    if (books?.length > 0 && !force) return;

    set({ loadingBooks: true, booksError: null, bookSuccess: null });

    try {
      const { data } = await axios.get(
        `${booksEndpoint}/fetch-user-books/${user_id}`
      );

      set({
        loadingBooks: false,
        userBooks: data.userBooks || [],
        bookSuccess: data.message || "Books fetched successfully",
      });

      return { success: true, message: "Books fetched successfully" };
    } catch (error) {
      console.error("❌ Error fetching books:", error);

      set({
        loadingBooks: false,
        booksError: error.response?.data?.message || "Failed to fetch books",
      });

      return { success: false, message: "Failed to fetch books" };
    }
  },
}));
