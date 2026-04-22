const db = require("../../../models");
const redis = require("../../config/redis");
const { Op } = require("sequelize");

const { Loan, Employee, Transaction, Cashflow } = db;

// 🔥 CLEAR CACHE
const clearCache = async () => {
  if (redis) {
    try {
      await redis.del("loans");
    } catch (err) {
      console.log("Redis error:", err.message);
    }
  }
};

// 🔥 CORE HITUNG LOAN
const calculateLoan = (employee, principal, interest_rate = 5) => {
  const salary = Number(employee.salary || 0);
  const salaryType = employee.salary_type;

  const maxInstallment = salary * 0.3;

  let tenor;
  let installment;
  let type;

  if (salaryType === "weekly") {
    const maxLoan = salary * 2;
    tenor = 8;
    type = "weekly";

    if (principal > maxLoan) {
      throw { status: 400, message: "Max pinjaman mingguan = 2x gaji" };
    }

    const interest = Math.round(principal * (interest_rate / 100));
    const total = principal + interest;

    installment = total / tenor;

    if (installment > maxInstallment) {
      throw { status: 400, message: "Cicilan > 30% gaji" };
    }

    return { tenor, installment, type, interest, total };
  }

  if (salaryType === "monthly") {
    tenor = principal <= 1500000 ? 3 : 5;
    type = "monthly";

    const maxLoan = maxInstallment * tenor;

    if (principal > maxLoan) {
      throw { status: 400, message: "Pinjaman melebihi batas aman" };
    }

    const interest = Math.round(principal * (interest_rate / 100));
    const total = principal + interest;

    installment = total / tenor;

    return { tenor, installment, type, interest, total };
  }

  throw { status: 400, message: "Tipe gaji tidak valid" };
};

// 🔥 CREATE LOAN + CASHFLOW
const createLoan = async ({ employee_id, amount, interest_rate = 5 }) => {
  const employee = await Employee.findByPk(employee_id);

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
  });

  if (existingLoan) {
    throw {
      status: 400,
      message: "Karyawan masih punya loan aktif",
    };
  }

  // 🔥 HITUNG
  const result = calculateLoan(employee, principal, interest_rate);

  const now = new Date();

  let dueDate = new Date(now);
  if (result.type === "monthly") {
    dueDate.setMonth(dueDate.getMonth() + result.tenor);
  } else {
    dueDate.setDate(dueDate.getDate() + result.tenor * 7);
  }

  // 🔥 CREATE LOAN
  const loan = await Loan.create({
    employee_id,

    principal_amount: principal,
    interest_amount: result.interest,
    interest_rate,

    total_amount: result.total,
    remaining_amount: result.total,

    tenor: result.tenor,
    installment: Math.round(result.installment),
    type: result.type,
    status: "ongoing",

    disbursed_at: now,
    due_date: dueDate,
  });

  // 🔥 CASHFLOW OUT (PENTING BANGET)
  await Cashflow.create({
    type: "out",
    amount: total_amount, // ✅ FIX
    source: "loan",
    reference_id: loan.id,
    note: "Pencairan pinjaman",
  });

  await clearCache();

  return loan;
};

// 🔥 GET ALL
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

// 🔥 DETAIL
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

// 🔥 UPDATE (LOCK)
const updateLoan = async (id, data) => {
  const loan = await Loan.findByPk(id);

  if (!loan) {
    throw { status: 404, message: "Loan not found" };
  }

  const trxCount = await Transaction.count({
    where: { loan_id: id },
  });

  if (trxCount > 0) {
    throw {
      status: 400,
      message: "Loan sudah berjalan, tidak bisa diubah",
    };
  }

  await loan.update(data);

  await clearCache();

  return loan;
};

// 🔥 DELETE
const deleteLoan = async (id) => {
  const loan = await Loan.findByPk(id);

  if (!loan) {
    throw { status: 404, message: "Loan not found" };
  }

  const trxCount = await Transaction.count({
    where: { loan_id: id },
  });

  if (trxCount > 0) {
    throw {
      status: 400,
      message: "Loan sudah punya cicilan, tidak bisa dihapus",
    };
  }

  await loan.destroy();

  await clearCache();

  return true;
};

// 🔥 SIMULATE (FE PREVIEW)
const simulateLoan = async ({ employee_id, amount, interest_rate = 5 }) => {
  const employee = await Employee.findByPk(employee_id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  const result = calculateLoan(employee, amount, interest_rate);

  return result;
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  simulateLoan,
};
