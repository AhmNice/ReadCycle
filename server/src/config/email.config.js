import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sender =`"ReadCycle" <${process.env.EMAIL_USER}>`

// await transporter.sendMail({
//   from: '"ReadCycle" <no-reply@readcycle.com>',
//   to: "yunuslawal@gmail.com",
//   subject: "Your ReadCycle OTP Code",
//   html: otpEmailTemplate("Yunus Lawal", "976586"),
// });
