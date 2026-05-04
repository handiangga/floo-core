const response = require("../utils/response");

const rbac = (roles = []) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      // 🔐 wajib login
      if (!user) {
        return response.error(res, "Unauthorized", 401);
      }

      // 🔥 validasi role user ada
      if (!user.role) {
        return response.error(res, "Role tidak ditemukan", 403);
      }

      // 🔥 jika roles di-set → enforce
      if (roles.length > 0) {
        if (!roles.includes(user.role)) {
          return response.error(
            res,
            `Forbidden: butuh role ${roles.join(", ")}`,
            403,
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = rbac;
