const db = require("../../../models");

const { Cashflow } = db;

const { fn, col, literal } = require("sequelize");

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

  // ===============================================
  // 🔥 GROUPING
  // ===============================================
  const grouped = {};

  for (const item of result) {
    const date = item.date;

    if (!grouped[date]) {
      grouped[date] = {
        date,

        cashIn: 0,

        cashOut: 0,
      };
    }

    if (item.type === "in") {
      grouped[date].cashIn = Number(item.total) || 0;
    }

    if (item.type === "out") {
      grouped[date].cashOut = Number(item.total) || 0;
    }
  }

  return Object.values(grouped);
};

// =====================================================
// 🔥 GET RECENT ACTIVITIES
// =====================================================
const getRecentActivities = async (limit = 10) => {
  const result = await Cashflow.findAll({
    limit,

    order: [["createdAt", "DESC"]],

    raw: true,
  });

  return result.map((item) => ({
    id: item.id,

    type: item.type,

    source: item.source || "-",

    amount: Number(item.amount) || 0,

    description: item.description || "-",

    date: item.createdAt,
  }));
};

module.exports = {
  getCashBalance,

  getCashflowChart,

  getRecentActivities,
};
