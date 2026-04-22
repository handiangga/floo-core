const service = require("./auth.service");
const response = require("../../utils/response");

const { loginSchema, registerSchema } = require("./auth.validation");

// 🔥 REGISTER
exports.register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.register(req.body);

    response.success(res, data, "User created");
  } catch (err) {
    next(err);
  }
};

// 🔥 LOGIN
exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.login(req.body);

    response.success(res, data, "Login success");
  } catch (err) {
    next(err);
  }
};
