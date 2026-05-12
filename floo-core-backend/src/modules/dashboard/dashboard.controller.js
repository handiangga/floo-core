const service = require("./dashboard.service");
const response = require("../../utils/response");

// ======================================================
// 🔥 ADMIN DASHBOARD
// ======================================================
exports.getDashboard = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // 🔥 DEBUG
    console.log("ADMIN DASHBOARD USER:", req.user);

    const data = await service.getDashboard({
      user: req.user || { role: "admin" },

      start_date,

      end_date,
    });

    response.success(res, data, "Dashboard fetched");
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);

    next(err);
  }
};

// ======================================================
// 🔥 MANAGER DASHBOARD
// ======================================================
exports.getManagerDashboard = async (req, res, next) => {
  try {
    console.log("MANAGER DASHBOARD USER:", req.user);

    const data = await service.getManagerDashboard({
      user: req.user || { role: "manager" },
    });

    response.success(res, data, "Manager dashboard fetched");
  } catch (err) {
    console.error("MANAGER DASHBOARD ERROR:", err);

    next(err);
  }
};

// ======================================================
// 🔥 OWNER DASHBOARD
// ======================================================
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    console.log("OWNER DASHBOARD USER:", req.user);

    const data = await service.getOwnerDashboard({
      user: req.user || { role: "owner" },
    });

    response.success(res, data, "Owner dashboard fetched");
  } catch (err) {
    console.error("OWNER DASHBOARD ERROR:", err);

    next(err);
  }
};
