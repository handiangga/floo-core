const db = require("../../../models");
const { Op } = require("sequelize");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const { Transaction, Loan, Cashflow } = db;

// ============================
// 🔥 RECALC LOAN
// ============================
const recalcLoanTransactions = async (loan_id, t) => {
  const loan = await Loan.findByPk(loan_id, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!loan) throw { status: 404, message: "Loan not found" };

  let remaining = loan.total_amount;

  const transactions = await Transaction.findAll({
    where: { loan_id },
    order: [
      ["payment_date", "ASC"],
      ["createdAt", "ASC"],
    ],
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

  // 🔥 OVERDUE CHECK
  const now = new Date();

  let status = "ongoing";

  if (remaining === 0) {
    status = "paid";
  } else if (loan.due_date && now > loan.due_date) {
    status = "overdue";
  }

  loan.remaining_amount = remaining;
  loan.status = status;

  await loan.save({ transaction: t });
};

// ============================
// 🔥 CREATE TRANSACTION
// ============================
const createTransaction = async ({ loan_id, amount, file, user_id = null }) => {
  return await db.sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

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

    // 🔥 DUPLICATE PROTECTION (5 detik)
    const existing = await Transaction.findOne({
      where: {
        loan_id,
        amount,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5000),
        },
      },
      transaction: t,
    });

    if (existing) {
      throw { status: 400, message: "Duplicate payment detected" };
    }

    const trx = await Transaction.create(
      {
        loan_id,
        amount,
        proof: file || null,
        remaining_after: 0,
        payment_date: new Date(),
        type: loan.type,
      },
      { transaction: t },
    );

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
    await clearAllCache();

    await logAudit({
      user_id,
      action: "CREATE",
      entity: "transaction",
      entity_id: trx.id,
      description: `Payment ${amount}`,
    });

    return trx;
  });
};

// ============================
// 🔥 GET ALL
// ============================
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
    order: [
      ["payment_date", "ASC"],
      ["createdAt", "ASC"],
    ],
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

// ============================
// 🔥 DETAIL
// ============================
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

// ============================
// 🔥 UPDATE
// ============================
const updateTransaction = async (id, { amount, file }, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const trx = await Transaction.findByPk(id, { transaction: t });

    if (!trx) throw { status: 404, message: "Transaction not found" };

    const loan = await Loan.findByPk(trx.loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

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

    if (file) trx.proof = file;

    await trx.save({ transaction: t });

    await recalcLoanTransactions(trx.loan_id, t);
    await clearAllCache();

    await logAudit({
      user_id,
      action: "UPDATE",
      entity: "transaction",
      entity_id: id,
      description: "Update transaction",
    });

    return trx;
  });
};

// ============================
// 🔥 DELETE
// ============================
const deleteTransaction = async (id, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const trx = await Transaction.findByPk(id, { transaction: t });

    if (!trx) throw { status: 404, message: "Transaction not found" };

    const loan_id = trx.loan_id;

    // 🔥 DELETE CASHFLOW TERKAIT
    await Cashflow.destroy({
      where: {
        reference_id: loan_id,
        source: "payment",
        amount: trx.amount,
      },
      transaction: t,
    });

    await trx.destroy({ transaction: t });

    await recalcLoanTransactions(loan_id, t);
    await clearAllCache();

    await logAudit({
      user_id,
      action: "DELETE",
      entity: "transaction",
      entity_id: id,
      description: "Delete transaction",
    });

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
