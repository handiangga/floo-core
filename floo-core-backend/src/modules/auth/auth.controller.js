const service = require("./auth.service");
const response = require("../../utils/response");

const { loginSchema, registerSchema } = require("./auth.validation");

// ================= REGISTER =================
// 🔥 HARUS lewat verifyToken + allowRoles("admin")
exports.register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);

    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }

    // 🔥 kirim creator (req.user dari JWT)
    const data = await service.register(req.body, req.user);

    return response.success(res, data, "User created");
  } catch (err) {
    next(err);
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }

    const data = await service.login(req.body);

    return response.success(res, data, "Login success");
  } catch (err) {
    next(err);
  }
};

// ================= PROFILE =================
exports.me = async (req, res, next) => {
  try {
    const data = await service.getProfile(req.user.id);

    return response.success(res, data, "Profile fetched");
  } catch (err) {
    next(err);
  }
};
