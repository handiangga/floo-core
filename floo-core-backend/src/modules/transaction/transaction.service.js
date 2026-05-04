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

  loan.remaining_amount = remaining;
  loan.status = remaining === 0 ? "completed" : "ongoing";

  await loan.save({ transaction: t });
};

// ============================
// 🔥 CREATE TRANSACTION
// ============================
const createTransaction = async ({ loan_id, amount, proof, user }) => {
  return await db.sequelize.transaction(async (t) => {
    // 🔐 SECURITY
    if (!["admin", "owner"].includes(user.role)) {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status !== "ongoing") {
      throw { status: 400, message: "Loan belum aktif" };
    }

    if (loan.remaining_amount <= 0) {
      throw { status: 400, message: "Loan already completed" };
    }

    amount = Number(amount);

    if (!amount || amount <= 0) {
      throw { status: 400, message: "Amount must be greater than 0" };
    }

    if (amount > loan.remaining_amount) {
      throw { status: 400, message: "Melebihi sisa pinjaman" };
    }

    // 🔥 DUPLICATE PROTECTION
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
        proof: proof || null,
        remaining_after: 0,
        payment_date: new Date(),
        type: loan.type,
      },
      { transaction: t },
    );

    // 🔥 CASHFLOW (pakai trx.id biar precise)
    await Cashflow.create(
      {
        type: "in",
        amount,
        source: "payment",
        reference_id: trx.id,
        note: "Pembayaran pinjaman",
      },
      { transaction: t },
    );

    await recalcLoanTransactions(loan_id, t);

    await clearAllCache();

    await logAudit({
      user_id: user.id,
      action: "CREATE",
      entity: "transaction",
      entity_id: trx.id,
      description: `Payment ${amount}`,
    });

    return trx;
  });
};

// ============================
// 🔥 GET ALL (RBAC)
// ============================
const getAllTransactions = async ({ page = 1, limit = 10, loan_id, user }) => {
  const offset = (page - 1) * limit;

  const where = {};
  if (loan_id) where.loan_id = loan_id;

  const include = [
    {
      model: Loan,
      attributes: ["id", "type", "status"],
    },
  ];

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include,
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
// 🔥 GET DETAIL
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
// 🔥 DELETE
// ============================
const deleteTransaction = async (id, user) => {
  return await db.sequelize.transaction(async (t) => {
    if (user.role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const trx = await Transaction.findByPk(id, { transaction: t });

    if (!trx) throw { status: 404, message: "Transaction not found" };

    const loan_id = trx.loan_id;

    // 🔥 delete cashflow by trx.id
    await Cashflow.destroy({
      where: {
        reference_id: trx.id,
        source: "payment",
      },
      transaction: t,
    });

    await trx.destroy({ transaction: t });

    await recalcLoanTransactions(loan_id, t);

    await clearAllCache();

    await logAudit({
      user_id: user.id,
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
  deleteTransaction,
};
