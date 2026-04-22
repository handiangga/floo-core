const db = require("../../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = db;

// 🔥 LOGIN
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 400, message: "Invalid credentials" };
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  };
};

// 🔥 REGISTER (admin only nanti via RBAC)
const register = async ({ name, email, password, role }) => {
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

  return user;
};

module.exports = {
  login,
  register,
};
