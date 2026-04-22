const service = require("./dashboard.service");
const response = require("../../utils/response");

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard();
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};
