import jwt from "jsonwebtoken";

export const createSession = (res, userData) => {
  try {
    const secret_key = process.env.JWT_SECRET; 
    const token = jwt.sign(userData, secret_key, { expiresIn: "1h" });

    const sessionName = "readCycle_userSession";

    res.cookie(sessionName, token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", 
      maxAge: 3600 * 1000,
    });

    return token;
  } catch (error) {
    console.error("❌ Error creating session:", error.message);
    throw new Error("Failed to create session");
  }
};

// ✅ verifySession middleware
export const verifySession = (req, res, next) => {
  const sessionName = "readCycle_userSession";
  const token = req.cookies[sessionName];

  if (!token) {
    return res.status(401).json({ success: false, message: "No session found" });
  }

  try {
    const secret_key = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret_key);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("❌ Invalid or expired token:", error.message);
    return res.status(403).json({ success: false, message: "Invalid or expired session" });
  }
};
