const db = require("../../../models");
const { Op, fn, col, literal } = require("sequelize");

const { Employee, Loan, Transaction, Cashflow } = db;

// ============================
// 🔧 HELPER: fill missing dates (optional)
// ============================
const fillDates = (rows, days = 14) => {
  const map = {};
  rows.forEach((r) => (map[r.date] = r));

  const result = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const key = d.toISOString().slice(0, 10);

    result.push(
      map[key] || {
        date: key,
        masuk: 0,
        keluar: 0,
      },
    );
  }

  return result;
};

// ============================
// 🔥 MAIN SERVICE
// ============================
const getDashboard = async (user = null) => {
  const now = new Date();

  // ============================
  // 🔐 ROLE FILTER (OPTIONAL)
  // ============================
  const loanWhere = {};

  if (user?.role === "manager") {
    loanWhere.status = "pending_manager";
  }

  if (user?.role === "owner") {
    loanWhere.status = "pending_owner";
  }

  // ============================
  // 🔥 KPI (PARALLEL)
  // ============================
  const [
    totalEmployees,
    totalLoanRaw,
    totalRemainingRaw,
    totalPaymentRaw,
    activeLoans,
    paidLoans,
    overdueLoans,
  ] = await Promise.all([
    Employee.count(),

    Loan.sum("total_amount"),

    Loan.sum("remaining_amount"),

    Transaction.sum("amount"),

    Loan.count({
      where: { remaining_amount: { [Op.gt]: 0 }, ...loanWhere },
    }),

    Loan.count({
      where: { remaining_amount: 0, ...loanWhere },
    }),

    Loan.count({
      where: {
        remaining_amount: { [Op.gt]: 0 },
        due_date: { [Op.lt]: now },
        ...loanWhere,
      },
    }),
  ]);

  const totalLoan = Number(totalLoanRaw) || 0;
  const totalRemaining = Number(totalRemainingRaw) || 0;
  const totalPayment = Number(totalPaymentRaw) || 0;

  const collectionRate =
    totalLoan > 0 ? ((totalLoan - totalRemaining) / totalLoan) * 100 : 0;

  // ============================
  // 🔥 CASHFLOW CHART
  // ============================
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

  for (const c of cashflowRaw) {
    const date = c.date;
    const total = Number(c.total) || 0;

    if (!grouped[date]) {
      grouped[date] = { date, masuk: 0, keluar: 0 };
    }

    if (c.type === "in") grouped[date].masuk += total;
    if (c.type === "out") grouped[date].keluar += total;
  }

  let cashflow = Object.values(grouped);

  // 🔥 optional: isi tanggal kosong (biar chart smooth)
  cashflow = fillDates(cashflow, 14);

  // ============================
  // 🔥 CASH BALANCE
  // ============================
  const cashRaw = await Cashflow.findAll({
    attributes: [
      "type",
      [fn("COALESCE", fn("SUM", col("amount")), 0), "total"],
    ],
    group: ["type"],
    raw: true,
  });

  let totalIn = 0;
  let totalOut = 0;

  for (const c of cashRaw) {
    const total = Number(c.total) || 0;

    if (c.type === "in") totalIn += total;
    if (c.type === "out") totalOut += total;
  }

  const cashBalance = totalIn - totalOut;

  // ============================
  // 🔥 ACTIVITIES
  // ============================
  const activitiesRaw = await Cashflow.findAll({
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Loan,
        as: "Loan",
        attributes: ["id"],
        required: false,
        include: [
          {
            model: Employee,
            as: "Employee",
            attributes: ["name"],
            required: false,
          },
        ],
      },
    ],
  });

  const activities = activitiesRaw.map((item) => {
    const employeeName = item.Loan?.Employee?.name;

    let label = "-";

    if (item.source === "loan") label = "Pinjaman Baru";
    if (item.source === "payment") label = "Pembayaran";

    return {
      id: item.id,
      amount: Number(item.amount) || 0,
      type: item.type,
      source: item.source,
      date: item.createdAt,
      employee: employeeName || label,
    };
  });

  // ============================
  // 🔥 TOP DEBTOR
  // ============================
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
    total: Number(item.dataValues.total) || 0,
  }));

  // ============================
  // 🔥 FINAL RESPONSE
  // ============================
  return {
    summary: {
      totalEmployees,
      totalLoan,
      totalRemaining,
      totalPayment,
      activeLoans,
      paidLoans,
      collectionRate: Number(collectionRate.toFixed(2)),
      overdueLoans,

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
