const jwt = require("jsonwebtoken");

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    // ❌ tidak ada header
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized - No header" });
    }

    // ❌ format salah
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - Invalid format" });
    }

    const token = authHeader.split(" ")[1];

    // ❌ token kosong
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Empty token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    // ❌ payload aneh
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= ROLE CHECK =================
const allowRoles = (...roles) => {
  return (req, res, next) => {
    // 🔥 SAFETY FIX
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: akses tidak diizinkan",
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  allowRoles,
};
