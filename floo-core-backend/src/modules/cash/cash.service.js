const db = require("../../../models");
const { Cashflow } = db;
const { fn, col } = require("sequelize");

const getCashBalance = async () => {
  const result = await Cashflow.findAll({
    attributes: ["type", [fn("SUM", col("amount")), "total"]],
    group: ["type"],
    raw: true,
  });

  let totalIn = 0;
  let totalOut = 0;

  result.forEach((item) => {
    const total = Number(item.total) || 0;

    if (item.type === "in") totalIn = total;
    else totalOut = total;
  });

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
};

module.exports = {
  getCashBalance,
};
