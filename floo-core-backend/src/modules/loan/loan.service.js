const db = require("../../../models");
const { Op } = require("sequelize");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const generateLoanPdf = require("../../utils/generateLoanPdf");

const { Loan, Employee, Cashflow } = db;

// ============================
// 🔥 CALCULATE LOAN
// ============================
const calculateLoan = (employee, principal, interest_rate = 0, tenorInput) => {
  const salary = Number(employee.salary || 0);
  const salaryType = employee.salary_type;

  if (!salary) throw { status: 400, message: "Gaji tidak valid" };

  const maxInstallment = salary * 0.5;

  if (principal > salary * 2) {
    throw { status: 400, message: "Max pinjaman = 2x gaji" };
  }

  const interest = Math.round(principal * (interest_rate / 100));
  const total = principal + interest;

  let tenor;
  let installment;
  let type;

  if (salaryType === "weekly") {
    type = "weekly";
    tenor = tenorInput || 4;
    installment = Math.ceil(total / tenor);
  } else {
    type = "monthly";
    tenor = tenorInput || 3;
    installment = Math.ceil(total / tenor);
  }

  if (installment > maxInstallment) {
    throw { status: 400, message: "Cicilan > 50% gaji" };
  }

  return { tenor, installment, type, interest, total };
};

// ============================
// 🔥 CREATE LOAN
// ============================
const createLoan = async (payload, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user.role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const employee = await Employee.findByPk(payload.employee_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!employee) throw { status: 404, message: "Employee not found" };

    const existingLoan = await Loan.findOne({
      where: {
        employee_id: payload.employee_id,
        status: {
          [Op.in]: [
            "pending_manager",
            "pending_owner",
            "waiting_signature",
            "signed",
            "ongoing",
          ],
        },
      },
      transaction: t,
    });

    if (existingLoan) {
      throw { status: 400, message: "Masih ada loan aktif" };
    }

    const result = calculateLoan(
      employee,
      payload.principal_amount,
      payload.interest_rate,
      payload.tenor,
    );

    let dueDate = new Date();
    if (result.type === "monthly") {
      dueDate.setMonth(dueDate.getMonth() + result.tenor);
    } else {
      dueDate.setDate(dueDate.getDate() + result.tenor * 7);
    }

    const loan = await Loan.create(
      {
        employee_id: payload.employee_id,
        principal_amount: payload.principal_amount,
        interest_amount: result.interest,
        interest_rate: payload.interest_rate,
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
      description: `Create loan ${payload.principal_amount}`,
    });

    return loan;
  });
};

// ============================
// 🔥 GET ALL
// ============================
const getAllLoans = async () => {
  return await Loan.findAll({
    include: [{ model: Employee, as: "Employee" }],
    order: [["createdAt", "DESC"]],
  });
};

// ============================
// 🔥 GET DETAIL
// ============================
const getLoanById = async (id) => {
  return await Loan.findByPk(id, {
    include: [{ model: Employee, as: "Employee" }],
  });
};

// ============================
// 🔥 UPDATE
// ============================
const updateLoan = async (id, payload) => {
  await Loan.update(payload, { where: { id } });
  return await getLoanById(id);
};

// ============================
// 🔥 DELETE
// ============================
const deleteLoan = async (id) => {
  return await Loan.destroy({ where: { id } });
};

// ============================
// 🔥 SIMULATE
// ============================
const simulateLoan = async (payload) => {
  const employee = await Employee.findByPk(payload.employee_id);

  if (!employee) throw { status: 404, message: "Employee not found" };

  return calculateLoan(
    employee,
    payload.principal_amount,
    payload.interest_rate,
    payload.tenor,
  );
};

// ============================
// 🔥 APPROVE MANAGER
// ============================
const approveByManager = async (loan_id, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user.role !== "manager") {
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
// 🔥 REJECT MANAGER
// ============================
const rejectByManager = async (loan_id, reason, user = {}) => {
  const loan = await Loan.findByPk(loan_id);

  if (!loan) throw { status: 404, message: "Loan not found" };

  if (loan.status !== "pending_manager") {
    throw { status: 400, message: "Invalid status" };
  }

  return await loan.update({
    status: "rejected_manager",
    reject_reason_manager: reason,
  });
};

// ============================
// 🔥 APPROVE OWNER + PDF
// ============================
const approveByOwner = async (loan_id, user = {}) => {
  if (user.role !== "owner") {
    throw { status: 403, message: "Forbidden" };
  }

  const loan = await Loan.findByPk(loan_id, {
    include: [{ model: Employee, as: "Employee" }],
  });

  if (!loan) throw { status: 404, message: "Loan not found" };

  if (loan.status !== "pending_owner") {
    throw { status: 400, message: "Invalid status" };
  }

  // 🔥 generate PDF (OUTSIDE transaction)
  const contractUrl = await generateLoanPdf(loan, loan.Employee);

  await loan.update({
    status: "waiting_signature",
    approved_by_owner: user.id,
    approved_at_owner: new Date(),
    loan_agreement: contractUrl,
  });

  return loan;
};

// ============================
// 🔥 REJECT OWNER
// ============================
const rejectByOwner = async (loan_id, reason) => {
  const loan = await Loan.findByPk(loan_id);

  if (!loan) throw { status: 404, message: "Loan not found" };

  if (loan.status !== "pending_owner") {
    throw { status: 400, message: "Invalid status" };
  }

  return await loan.update({
    status: "rejected_owner",
    reject_reason_owner: reason,
  });
};

// ============================
// 🔥 UPLOAD SIGNED CONTRACT
// ============================
const uploadSignedContract = async (loan_id, fileUrl) => {
  const loan = await Loan.findByPk(loan_id);

  if (!loan) throw { status: 404, message: "Loan not found" };

  if (loan.status !== "waiting_signature") {
    throw { status: 400, message: "Status tidak valid" };
  }

  await loan.update({
    signed_contract_url: fileUrl,
    status: "signed",
    signed_at: new Date(),
  });

  return loan;
};

// ============================
// 🔥 DISBURSE
// ============================
const disburseLoan = async (loan_id, user = {}) => {
  return await db.sequelize.transaction(async (t) => {
    if (user.role !== "admin") {
      throw { status: 403, message: "Forbidden" };
    }

    const loan = await Loan.findByPk(loan_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!loan) throw { status: 404, message: "Loan not found" };

    if (loan.status !== "signed") {
      throw { status: 400, message: "Belum tanda tangan" };
    }

    const now = new Date();

    await loan.update(
      {
        status: "ongoing",
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

    return loan;
  });
};

// ============================
// 🔥 EXPORT
// ============================
module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  simulateLoan,

  approveByManager,
  rejectByManager,

  approveByOwner,
  rejectByOwner,

  uploadSignedContract,
  disburseLoan,
};
