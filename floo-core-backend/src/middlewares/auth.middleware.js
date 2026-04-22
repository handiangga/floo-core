const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    console.log("HEADERS:", req.headers); // 👈 tambah ini

    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader); // 👈 tambah ini

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token); // 👈 tambah ini

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded); // 👈 tambah ini

    req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // 👈 penting
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
};
