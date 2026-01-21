export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
import crypto from "crypto";

export const generateAndHashResetToken = () => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Hash it before storing
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hashedToken };
};
