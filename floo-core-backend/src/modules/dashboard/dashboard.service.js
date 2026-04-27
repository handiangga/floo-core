const db = require("../../../models");
const { Op, fn, col, literal } = require("sequelize");

const { Employee, Loan, Transaction, Cashflow } = db;

const getDashboard = async () => {
  // =========================================================
  // 🔥 KPI
  // =========================================================
  const [
    totalEmployees,
    totalLoanRaw,
    totalRemainingRaw,
    totalPaymentRaw,
    activeLoans,
    paidLoans,
  ] = await Promise.all([
    Employee.count(),
    Loan.sum("total_amount"),
    Loan.sum("remaining_amount"),
    Transaction.sum("amount"),
    Loan.count({ where: { remaining_amount: { [Op.gt]: 0 } } }),
    Loan.count({ where: { remaining_amount: 0 } }),
  ]);

  const totalLoan = Number(totalLoanRaw || 0);
  const totalRemaining = Number(totalRemainingRaw || 0);
  const totalPayment = Number(totalPaymentRaw || 0);

  const collectionRate =
    totalLoan > 0 ? ((totalLoan - totalRemaining) / totalLoan) * 100 : 0;

  // =========================================================
  // 🔥 RISKY LOAN
  // =========================================================
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const riskyLoans = await Loan.count({
    where: {
      remaining_amount: { [Op.gt]: 0 },
      createdAt: { [Op.lt]: sevenDaysAgo },
    },
  });

  // =========================================================
  // 🔥 CASHFLOW CHART
  // =========================================================
  const cashflowRaw = await Cashflow.findAll({
    attributes: [
      [fn("DATE", col("createdAt")), "date"],
      "type",
      [fn("SUM", col("amount")), "total"],
    ],
    group: [fn("DATE", col("createdAt")), "type"],
    order: [[literal("date"), "ASC"]],
    raw: true,
  });

  const grouped = {};

  cashflowRaw.forEach((c) => {
    const date = c.date;
    const type = c.type;
    const total = Number(c.total);

    if (!grouped[date]) {
      grouped[date] = { date, masuk: 0, keluar: 0 };
    }

    if (type === "in") grouped[date].masuk += total;
    else grouped[date].keluar += total;
  });

  const cashflow = Object.values(grouped);

  // =========================================================
  // 🔥 CASH BALANCE
  // =========================================================
  const cashRaw = await Cashflow.findAll({
    attributes: ["type", [fn("SUM", col("amount")), "total"]],
    group: ["type"],
    raw: true,
  });

  let totalIn = 0;
  let totalOut = 0;

  cashRaw.forEach((c) => {
    if (c.type === "in") totalIn = Number(c.total);
    else totalOut = Number(c.total);
  });

  const cashBalance = totalIn - totalOut;

  // =========================================================
  // 🔥 ACTIVITIES (FINAL FIX 🔥)
  // =========================================================
  const activitiesRaw = await Cashflow.findAll({
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Loan,
        as: "Loan",
        attributes: ["id"],
        include: [
          {
            model: Employee,
            as: "Employee",
            attributes: ["name"],
          },
        ],
      },
    ],
  });

  const activities = activitiesRaw.map((item) => {
    const employeeName = item.Loan?.Employee?.name || null;

    return {
      id: item.id,
      amount: Number(item.amount) || 0,
      type: item.type,
      source: item.source,
      date: item.createdAt,

      // 🔥 FIX UTAMA DISINI
      employee:
        employeeName || (item.source === "loan" ? "Pencairan" : "Pembayaran"),
    };
  });

  // =========================================================
  // 🔥 TOP DEBTOR
  // =========================================================
  const topDebtorsRaw = await Loan.findAll({
    attributes: ["employee_id", [fn("SUM", col("remaining_amount")), "total"]],
    group: ["employee_id", "Employee.id"],
    order: [[literal("total"), "DESC"]],
    limit: 5,
    include: [
      {
        model: Employee,
        as: "Employee",
        attributes: ["name"],
      },
    ],
  });

  const topDebtors = topDebtorsRaw.map((item) => ({
    name: item.Employee?.name || "-",
    total: Number(item.dataValues.total || 0),
  }));

  return {
    summary: {
      totalEmployees,
      totalLoan,
      totalRemaining,
      totalPayment,
      activeLoans,
      paidLoans,
      collectionRate: Number(collectionRate.toFixed(2)),
      riskyLoans,

      cashBalance,
      cashIn: totalIn,
      cashOut: totalOut,
    },
    cashflow,
    activities,
    topDebtors,
  };
};

module.exports = {
  getDashboard,
};
