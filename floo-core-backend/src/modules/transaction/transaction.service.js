const db = require("../../../models");
const redis = require("../../config/redis");

const { Transaction, Loan, Cashflow } = db;

// 🔥 CLEAR CACHE
const clearCache = async () => {
  if (redis) {
    try {
      await redis.del("transactions");
    } catch (err) {
      console.log("Redis clear error:", err.message);
    }
  }
};

// 🔥 RECALC LOAN
const recalcLoanTransactions = async (loan_id, t) => {
  const loan = await Loan.findByPk(loan_id, { transaction: t });

  if (!loan) throw { status: 404, message: "Loan not found" };

  let remaining = loan.total_amount;

  const transactions = await Transaction.findAll({
    where: { loan_id },
    order: [["createdAt", "ASC"]],
    transaction: t,
  });

  for (const trx of transactions) {
    remaining -= trx.amount;

    if (remaining < 0) {
      throw { status: 400, message: "Overpayment detected" };
    }

    trx.remaining_after = remaining;
    await trx.save({ transaction: t });
  }

  loan.remaining_amount = remaining;
  loan.status = remaining === 0 ? "paid" : "ongoing";

  await loan.save({ transaction: t });
};

// 🔥 CREATE (PAYMENT + CASHFLOW IN)
const createTransaction = async ({ loan_id, amount, file }) => {
  return await db.sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(loan_id, { transaction: t });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.remaining_amount <= 0) {
      throw { status: 400, message: "Loan already paid" };
    }

    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
      throw { status: 400, message: "Amount must be greater than 0" };
    }

    if (amount > loan.remaining_amount) {
      throw { status: 400, message: "Amount exceeds remaining loan" };
    }

    // 🔥 CREATE TRANSACTION (FIX)
    const trx = await Transaction.create(
      {
        loan_id,
        amount,
        proof: file || null,
        remaining_after: 0,
        payment_date: new Date(),
        type: loan.type, // ✅ FIX (weekly / monthly)
      },
      { transaction: t },
    );

    // 🔥 CASHFLOW MASUK (INI BARU "in")
    await Cashflow.create(
      {
        type: "in",
        amount,
        source: "payment",
        reference_id: loan_id,
        note: "Pembayaran pinjaman",
      },
      { transaction: t },
    );

    await recalcLoanTransactions(loan_id, t);
    await clearCache();

    return trx;
  });
};

// 🔥 GET ALL
const getAllTransactions = async ({ page = 1, limit = 10, loan_id }) => {
  const offset = (page - 1) * limit;

  const where = {};
  if (loan_id) where.loan_id = loan_id;

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: Loan,
        attributes: ["id", "type", "status"],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "ASC"]],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// 🔥 DETAIL
const getTransactionById = async (id) => {
  const trx = await Transaction.findByPk(id, {
    include: [
      {
        model: Loan,
        attributes: ["id", "type", "status"],
      },
    ],
  });

  if (!trx) throw { status: 404, message: "Transaction not found" };

  return trx;
};

// 🔥 UPDATE
const updateTransaction = async (id, { amount, file }) => {
  return await db.sequelize.transaction(async (t) => {
    const trx = await Transaction.findByPk(id, { transaction: t });

    if (!trx) throw { status: 404, message: "Transaction not found" };

    const loan = await Loan.findByPk(trx.loan_id, { transaction: t });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status === "paid") {
      throw { status: 400, message: "Loan already paid" };
    }

    if (amount !== undefined) {
      amount = Number(amount);

      if (isNaN(amount) || amount <= 0) {
        throw { status: 400, message: "Invalid amount" };
      }

      trx.amount = amount;
    }

    if (file) {
      trx.proof = file;
    }

    await trx.save({ transaction: t });

    await recalcLoanTransactions(trx.loan_id, t);
    await clearCache();

    return trx;
  });
};

// 🔥 DELETE
const deleteTransaction = async (id) => {
  return await db.sequelize.transaction(async (t) => {
    const trx = await Transaction.findByPk(id, { transaction: t });

    if (!trx) throw { status: 404, message: "Transaction not found" };

    const loan_id = trx.loan_id;

    await trx.destroy({ transaction: t });

    await recalcLoanTransactions(loan_id, t);
    await clearCache();

    return true;
  });
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
