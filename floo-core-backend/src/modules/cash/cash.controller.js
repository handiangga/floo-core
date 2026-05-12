const service = require("./cash.service");

const response = require("../../utils/response");

// =====================================================
// 🔥 GET CASH DASHBOARD
// =====================================================
exports.getCash = async (req, res, next) => {
  try {
    // ===============================================
    // 🔥 BALANCE
    // ===============================================
    const balance = await service.getCashBalance();

    // ===============================================
    // 🔥 CASHFLOW CHART
    // ===============================================
    const cashflow = await service.getCashflowChart();

    // ===============================================
    // 🔥 RECENT ACTIVITIES
    // ===============================================
    const activities = await service.getRecentActivities();

    // ===============================================
    // 🔥 RESPONSE
    // ===============================================
    response.success(
      res,
      {
        balance,

        cashflow,

        activities,
      },
      "Cash dashboard fetched",
    );
  } catch (err) {
    console.error("CASH CONTROLLER ERROR:", err);

    next(err);
  }
};
