const db = require("../../../models");
const { Cashflow } = db;
const { fn, col } = require("sequelize");

const getCashBalance = async () => {
  const result = await Cashflow.findAll({
    attributes: [
      "type",
      [fn("COALESCE", fn("SUM", col("amount")), 0), "total"], // 🔥 anti null
    ],
    group: ["type"],
    raw: true,
  });

  let totalIn = 0;
  let totalOut = 0;

  for (const item of result) {
    const total = Number(item.total) || 0;

    if (item.type === "in") {
      totalIn += total; // 🔥 pakai += (future-proof)
    } else if (item.type === "out") {
      totalOut += total;
    }
    // 🔥 type lain diabaikan (lebih aman)
  }

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
};

module.exports = {
  getCashBalance,
};
