const db = require("../../../models");
const { Op } = require("sequelize");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const { Loan, Employee, Cashflow } = db;

// ============================
// 🔥 CALCULATE LOAN (SSOT)
// ============================
const calculateLoan = (employee, principal, interest_rate = 0, tenorInput) => {
  const salary = Number(employee.salary || 0);
  const salaryType = employee.salary_type;

  if (!salary) throw { status: 400, message: "Gaji tidak valid" };

  const maxInstallment = salary * 0.5;

  let tenor;
  let installment;
  let type;

  if (principal > salary * 2) {
    throw { status: 400, message: "Max pinjaman = 2x gaji" };
  }

  const interest = Math.round(principal * (interest_rate / 100));
  const total = principal + interest;

  if (salaryType === "weekly") {
    type = "weekly";
    tenor = tenorInput || 4;
    installment = Math.ceil(total / tenor);
  } else if (salaryType === "monthly") {
    type = "monthly";
    tenor = tenorInput || 3;
    installment = Math.ceil(total / tenor);
  } else {
    throw { status: 400, message: "Tipe gaji tidak valid" };
  }

  if (installment > maxInstallment) {
    throw { status: 400, message: "Cicilan > 50% gaji" };
  }

  return {
    tenor,
    installment,
    type,
    interest,
    total,
  };
};

// ============================
// 🔥 CREATE LOAN
// ============================
const createLoan = async ({
  employee_id,
  principal_amount,
  interest_rate = 0,
  tenor,
  user = {},
}) => {
  return await db.sequelize.transaction(async (t) => {
    const role = user?.role;

    if (role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const employee = await Employee.findByPk(employee_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!employee) throw { status: 404, message: "Employee not found" };

    const principal = Number(principal_amount);
    if (!principal || principal <= 0) {
      throw { status: 400, message: "Amount must be greater than 0" };
    }

    const existingLoan = await Loan.findOne({
      where: {
        employee_id,
        status: {
          [Op.in]: ["pending_manager", "pending_owner", "ongoing"],
        },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existingLoan) {
      throw {
        status: 400,
        message: "Karyawan masih punya loan aktif / pending",
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
        status: "pending_manager",
        due_date: dueDate,
      },
      { transaction: t },
    );

    await clearAllCache();

    await logAudit({
      user_id: user.id,
      action: "CREATE",
      entity: "loan",
      entity_id: loan.id,
      description: `Create loan ${principal}`,
    });

    return loan;
  });
};

// ============================
// 🔥 GET ALL (SAFE + RBAC)
// ============================
const getAllLoans = async (user = {}) => {
  const role = user?.role || "admin";

  const where = {};

  if (role === "manager") {
    where.status = "pending_manager";
  }

  if (role === "owner") {
    where.status = "pending_owner";
  }

  return await Loan.findAll({
    where,
    include: [
      {
        model: Employee,
        as: "Employee",
        attributes: ["id", "name", "position"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ============================
// 🔥 GET DETAIL (SAFE)
// ============================
const getLoanById = async (id, user = {}) => {
  const role = user?.role || "admin";

  const loan = await Loan.findByPk(id, {
    include: [
      {
        model: Employee,
        as: "Employee",
        attributes: ["id", "name", "position"],
      },
    ],
  });

  if (!loan) throw { status: 404, message: "Loan not found" };

  if (role === "manager" && loan.status !== "pending_manager") {
    throw { status: 403, message: "Forbidden" };
  }

  if (role === "owner" && loan.status !== "pending_owner") {
    throw { status: 403, message: "Forbidden" };
  }

  return loan;
};

// ============================
// 🔥 UPDATE LOAN
// ============================
const updateLoan = async (id, payload, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user?.role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status !== "pending_manager") {
      throw { status: 400, message: "Loan tidak bisa di edit" };
    }

    const employee = await Employee.findByPk(loan.employee_id, {
      transaction: t,
    });

    const principal = Number(payload.principal_amount || loan.principal_amount);
    const interest_rate = payload.interest_rate ?? loan.interest_rate;
    const tenor = payload.tenor ?? loan.tenor;

    const result = calculateLoan(employee, principal, interest_rate, tenor);

    let dueDate = new Date();
    if (result.type === "monthly") {
      dueDate.setMonth(dueDate.getMonth() + result.tenor);
    } else {
      dueDate.setDate(dueDate.getDate() + result.tenor * 7);
    }

    await loan.update(
      {
        principal_amount: principal,
        interest_amount: result.interest,
        interest_rate,
        total_amount: result.total,
        remaining_amount: result.total,
        tenor: result.tenor,
        installment: result.installment,
        type: result.type,
        due_date: dueDate,
      },
      { transaction: t },
    );

    return loan;
  });
};

// ============================
// 🔥 DELETE LOAN
// ============================
const deleteLoan = async (id, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user?.role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    const isPending =
      loan.status === "pending_manager" || loan.status === "pending_owner";

    if (!isPending) {
      throw {
        status: 400,
        message: "Loan tidak bisa dihapus (sudah berjalan)",
      };
    }

    await loan.destroy({ transaction: t });

    return true;
  });
};

// ============================
// 🔥 APPROVE MANAGER
// ============================
const approveByManager = async (loan_id, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user?.role !== "manager") {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status !== "pending_manager") {
      throw { status: 400, message: "Invalid status" };
    }

    await loan.update(
      {
        status: "pending_owner",
        approved_by_manager: user.id,
        approved_at_manager: new Date(),
      },
      { transaction: t },
    );

    return loan;
  });
};

// ============================
// 🔥 APPROVE OWNER
// ============================
const approveByOwner = async (loan_id, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user?.role !== "owner") {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status !== "pending_owner") {
      throw { status: 400, message: "Invalid status" };
    }

    const now = new Date();

    await loan.update(
      {
        status: "ongoing",
        approved_by_owner: user.id,
        approved_at_owner: now,
        disbursed_at: now,
      },
      { transaction: t },
    );

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
      user_id: user.id,
      action: "APPROVE",
      entity: "loan",
      entity_id: loan.id,
      description: `Approve loan ${loan.total_amount}`,
    });

    return loan;
  });
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  approveByManager,
  approveByOwner,
};
