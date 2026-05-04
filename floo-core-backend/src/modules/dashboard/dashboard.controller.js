const service = require("./dashboard.service");
const response = require("../../utils/response");

exports.getDashboard = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const data = await service.getDashboard({
      user: req.user, // 🔥 FIX WAJIB
      start_date,
      end_date,
    });

    response.success(res, data, "Dashboard fetched");
  } catch (err) {
    next(err);
  }
};
