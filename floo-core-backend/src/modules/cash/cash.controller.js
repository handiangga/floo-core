const service = require("./cash.service");
const response = require("../../utils/response");

exports.getCash = async (req, res, next) => {
  try {
    const data = await service.getCashBalance();
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};
