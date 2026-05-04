const db = require("../../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = db;

// ================= UTIL =================
const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  email: user.email,
});

// ================= LOGIN =================
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  // 🔥 anti user enumeration (pesan disamakan)
  if (!user) {
    throw { status: 400, message: "Invalid email or password" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 400, message: "Invalid email or password" };
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

// ================= REGISTER =================
// ⚠️ sebaiknya dipanggil oleh admin + middleware role
const register = async ({ name, email, password, role }, creator = null) => {
  // 🔥 whitelist role (sesuai sistem kamu)
  const allowedRoles = ["admin", "manager", "owner"];

  if (!allowedRoles.includes(role)) {
    throw { status: 400, message: "Role tidak valid" };
  }

  // 🔐 optional: hanya admin boleh buat user
  if (creator && creator.role !== "admin") {
    throw { status: 403, message: "Forbidden: hanya admin" };
  }

  const exist = await User.findOne({ where: { email } });

  if (exist) {
    throw { status: 400, message: "Email already used" };
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    role,
  });

  return sanitizeUser(user);
};

// ================= GET PROFILE =================
const getProfile = async (user_id) => {
  const user = await User.findByPk(user_id);

  if (!user) throw { status: 404, message: "User not found" };

  return sanitizeUser(user);
};

module.exports = {
  login,
  register,
  getProfile,
};
