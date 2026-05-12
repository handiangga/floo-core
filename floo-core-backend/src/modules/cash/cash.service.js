const db = require("../../../models");

const { Cashflow, Loan, Employee } = db;

const { fn, col, literal } = require("sequelize");

// =====================================================
// 🔥 HELPER FILL DATES
// =====================================================
const fillDates = (rows, days = 14) => {
  const map = {};

  rows.forEach((r) => {
    map[r.date] = r;
  });

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

// =====================================================
// 🔥 GET CASH BALANCE
// =====================================================
const getCashBalance = async () => {
  const result = await Cashflow.findAll({
    attributes: [
      "type",

      [fn("COALESCE", fn("SUM", col("amount")), 0), "total"],
    ],

    group: ["type"],

    raw: true,
  });

  let totalIn = 0;

  let totalOut = 0;

  for (const item of result) {
    const total = Number(item.total) || 0;

    if (item.type === "in") {
      totalIn += total;
    }

    if (item.type === "out") {
      totalOut += total;
    }
  }

  return {
    totalIn,

    totalOut,

    balance: totalIn - totalOut,
  };
};

// =====================================================
// 🔥 GET CASHFLOW CHART
// =====================================================
const getCashflowChart = async () => {
  const result = await Cashflow.findAll({
    attributes: [
      [literal('DATE("createdAt")'), "date"],

      "type",

      [fn("COALESCE", fn("SUM", col("amount")), 0), "total"],
    ],

    group: [literal('DATE("createdAt")'), "type"],

    order: [[literal('DATE("createdAt")'), "ASC"]],

    raw: true,
  });

  // =====================================================
  // 🔥 GROUPING
  // =====================================================
  const grouped = {};

  for (const item of result) {
    const date = item.date;

    const total = Number(item.total) || 0;

    if (!grouped[date]) {
      grouped[date] = {
        date,

        masuk: 0,

        keluar: 0,
      };
    }

    if (item.type === "in") {
      grouped[date].masuk += total;
    }

    if (item.type === "out") {
      grouped[date].keluar += total;
    }
  }

  let cashflow = Object.values(grouped);

  cashflow = fillDates(cashflow, 14);

  return cashflow;
};

// =====================================================
// 🔥 GET RECENT ACTIVITIES
// =====================================================
const getRecentActivities = async (limit = 10) => {
  const result = await Cashflow.findAll({
    limit,

    order: [["createdAt", "DESC"]],

    include: [
      {
        model: Loan,

        as: "Loan",

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

  return result.map((item) => ({
    id: item.id,

    type: item.type,

    source: item.source || "-",

    amount: Number(item.amount) || 0,

    description: item.description || "-",

    date: item.createdAt,

    employee: item.Loan?.Employee?.name || "-",
  }));
};

module.exports = {
  getCashBalance,

  getCashflowChart,

  getRecentActivities,
};
