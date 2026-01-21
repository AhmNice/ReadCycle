// middleWare/fileUploader.js
import multer from "multer";
import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

export const upload = multer({
  storage: multer.memoryStorage(),
});

export const uploadSingle = upload.single("profile_pic");
export const uploadBook = upload.single("book_cover");
