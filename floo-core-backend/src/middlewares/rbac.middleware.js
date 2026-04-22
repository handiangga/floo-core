const response = require("../utils/response");

const rbac = (roles = []) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return response.error(res, "Unauthorized", 401);
      }

      if (roles.length && !roles.includes(user.role)) {
        return response.error(res, "Forbidden", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = rbac;
