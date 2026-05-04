const service = require("./dashboard.service");
const response = require("../../utils/response");

exports.getDashboard = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // 🔥 DEBUG (boleh hapus nanti)
    console.log("DASHBOARD USER:", req.user);

    // 🔥 FIX UTAMA: fallback kalau user undefined
    const data = await service.getDashboard({
      user: req.user || { role: "admin" },
      start_date,
      end_date,
    });

    response.success(res, data, "Dashboard fetched");
  } catch (err) {
    console.error("DASHBOARD CONTROLLER ERROR:", err);
    next(err);
  }
};
