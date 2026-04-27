const service = require("./dashboard.service");
const response = require("../../utils/response");

exports.getDashboard = async (req, res, next) => {
  try {
    // 🔥 support query filter (future-proof)
    const { start_date, end_date } = req.query;

    const data = await service.getDashboard({
      start_date,
      end_date,
    });

    response.success(res, data, "Dashboard fetched");
  } catch (err) {
    next(err);
  }
};
