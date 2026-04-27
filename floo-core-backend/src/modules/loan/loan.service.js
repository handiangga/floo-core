const db = require("../../../models");
const { Op } = require("sequelize");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const { Loan, Employee, Transaction, Cashflow } = db;

// ============================
// 🔥 CALCULATE LOAN
// ============================
const calculateLoan = (employee, principal, interest_rate = 5, tenorInput) => {
  const salary = Number(employee.salary || 0);
  const salaryType = employee.salary_type;

  const maxInstallment = salary * 0.5;

  let tenor;
  let installment;
  let type;

  if (salaryType === "weekly") {
    type = "weekly";
    tenor = tenorInput || 4;

    if (principal > salary * 2) {
      throw { status: 400, message: "Max pinjaman = 2x gaji" };
    }

    const interest = Math.round(principal * (interest_rate / 100));
    const total = principal + interest;

    installment = Math.ceil(total / tenor);

    if (installment > maxInstallment) {
      throw { status: 400, message: "Cicilan > 50% gaji" };
    }

    return { tenor, installment, type, interest, total };
  }

  if (salaryType === "monthly") {
    type = "monthly";
    tenor = tenorInput || 3;

    if (principal > salary * 2) {
      throw { status: 400, message: "Max pinjaman = 2x gaji" };
    }

    const interest = Math.round(principal * (interest_rate / 100));
    const total = principal + interest;

    installment = Math.ceil(total / tenor);

    if (installment > maxInstallment) {
      throw { status: 400, message: "Cicilan > 50% gaji" };
    }

    return { tenor, installment, type, interest, total };
  }

  throw { status: 400, message: "Tipe gaji tidak valid" };
};

// ============================
// 🔥 CREATE LOAN (FINAL FIX)
// ============================
const createLoan = async ({
  employee_id,
  amount,
  interest_rate = 5,
  tenor,
  user_id = null,
}) => {
  return await db.sequelize.transaction(async (t) => {
    const employee = await Employee.findByPk(employee_id, {
      transaction: t,
      lock: t.LOCK.UPDATE, // 🔥 anti race condition
    });

    if (!employee) {
      throw { status: 404, message: "Employee not found" };
    }

    const principal = Number(amount);

    if (!principal || principal <= 0) {
      throw { status: 400, message: "Amount must be greater than 0" };
    }

    // 🔥 CEK LOAN AKTIF
    const existingLoan = await Loan.findOne({
      where: {
        employee_id,
        remaining_amount: { [Op.gt]: 0 },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existingLoan) {
      throw {
        status: 400,
        message: "Karyawan masih punya loan aktif",
      };
    }

    const result = calculateLoan(employee, principal, interest_rate, tenor);

    const now = new Date();

    let dueDate = new Date(now);
    if (result.type === "monthly") {
      dueDate.setMonth(dueDate.getMonth() + result.tenor);
    } else {
      dueDate.setDate(dueDate.getDate() + result.tenor * 7);
    }

    // 🔥 CREATE LOAN
    const loan = await Loan.create(
      {
        employee_id,
        principal_amount: principal,
        interest_amount: result.interest,
        interest_rate,
        total_amount: result.total,
        remaining_amount: result.total,
        tenor: result.tenor,
        installment: result.installment,
        type: result.type,
        status: "ongoing",
        disbursed_at: now,
        due_date: dueDate,
      },
      { transaction: t },
    );

    // 🔥 CASHFLOW OUT (WAJIB loan.id)
    await Cashflow.create(
      {
        type: "out",
        amount: loan.total_amount,
        source: "loan",
        reference_id: loan.id,
        note: "Pencairan pinjaman",
      },
      { transaction: t },
    );

    await clearAllCache();

    await logAudit({
      user_id,
      action: "CREATE",
      entity: "loan",
      entity_id: loan.id,
      description: `Create loan ${loan.total_amount}`,
    });

    return loan;
  });
};

// ============================
// 🔥 GET ALL
// ============================
const getAllLoans = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { rows, count } = await Loan.findAndCountAll({
    include: [
      {
        model: Employee,
        as: "Employee",
        attributes: ["id", "name", "position"],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
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
const getLoanById = async (id) => {
  const loan = await Loan.findByPk(id, {
    include: [
      {
        model: Employee,
        as: "Employee",
        attributes: ["id", "name", "position"],
      },
    ],
  });

  if (!loan) {
    throw { status: 404, message: "Loan not found" };
  }

  return loan;
};

// ============================
// 🔥 UPDATE
// ============================
const updateLoan = async (id, data, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t });

    if (!loan) {
      throw { status: 404, message: "Loan not found" };
    }

    const trxCount = await Transaction.count({
      where: { loan_id: id },
      transaction: t,
    });

    if (trxCount > 0) {
      throw {
        status: 400,
        message: "Loan sudah berjalan, tidak bisa diubah",
      };
    }

    await loan.update(data, { transaction: t });

    await clearAllCache();

    await logAudit({
      user_id,
      action: "UPDATE",
      entity: "loan",
      entity_id: id,
      description: "Update loan",
    });

    return loan;
  });
};

// ============================
// 🔥 DELETE
// ============================
const deleteLoan = async (id, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t });

    if (!loan) {
      throw { status: 404, message: "Loan not found" };
    }

    const trxCount = await Transaction.count({
      where: { loan_id: id },
      transaction: t,
    });

    if (trxCount > 0) {
      throw {
        status: 400,
        message: "Loan sudah punya cicilan, tidak bisa dihapus",
      };
    }

    await loan.destroy({ transaction: t });

    await clearAllCache();

    await logAudit({
      user_id,
      action: "DELETE",
      entity: "loan",
      entity_id: id,
      description: "Delete loan",
    });

    return true;
  });
};

// ============================
// 🔥 SIMULATE
// ============================
const simulateLoan = async ({
  employee_id,
  amount,
  interest_rate = 5,
  tenor,
}) => {
  const employee = await Employee.findByPk(employee_id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  return calculateLoan(employee, amount, interest_rate, tenor);
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  simulateLoan,
};
