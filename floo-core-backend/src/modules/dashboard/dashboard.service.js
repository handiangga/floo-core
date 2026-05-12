const db = require("../../../models");

const { Op, fn, col, literal } = require("sequelize");

const { Employee, Loan, Transaction, Cashflow } = db;

const cashService = require("../cash/cash.service");

// ============================
// 🔧 HELPER: fill missing dates
// ============================
const fillDates = (rows, days = 14) => {
  const map = {};

  rows.forEach((r) => {
    map[r.date] = r;
  });

  const result = [];

  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);

    d.setDate(d.getDate() - i);

    const key = d.toISOString().slice(0, 10);

    result.push(
      map[key] || {
        date: key,
        masuk: 0,
        keluar: 0,
      },
    );
  }

  return result;
};

// ============================
// 🔥 ADMIN DASHBOARD
// ============================
const getDashboard = async (params = {}) => {
  try {
    const { user } = params;

    const role = user?.role || "admin";

    const now = new Date();

    // ============================
    // 🔐 ROLE FILTER
    // ============================
    const loanWhere = {};

    if (role === "manager") {
      loanWhere.status = "pending_manager";
    }

    if (role === "owner") {
      loanWhere.status = "pending_owner";
    }

    // ============================
    // 🔥 KPI
    // ============================
    const [
      totalEmployees,
      totalLoanRaw,
      totalRemainingRaw,
      totalPaymentRaw,
      activeLoans,
      paidLoans,
      overdueLoans,
    ] = await Promise.all([
      Employee.count(),

      Loan.sum("total_amount"),

      Loan.sum("remaining_amount"),

      Transaction.sum("amount"),

      Loan.count({
        where: {
          remaining_amount: {
            [Op.gt]: 0,
          },

          status: "ongoing",

          ...loanWhere,
        },
      }),

      Loan.count({
        where: {
          status: "paid",

          ...loanWhere,
        },
      }),

      Loan.count({
        where: {
          remaining_amount: {
            [Op.gt]: 0,
          },

          due_date: {
            [Op.lt]: now,
          },

          status: "ongoing",

          ...loanWhere,
        },
      }),
    ]);

    const totalLoan = Number(totalLoanRaw) || 0;

    const totalRemaining = Number(totalRemainingRaw) || 0;

    const totalPayment = Number(totalPaymentRaw) || 0;

    const collectionRate =
      totalLoan > 0 ? ((totalLoan - totalRemaining) / totalLoan) * 100 : 0;

    // ============================
    // 🔥 CASHFLOW
    // ============================
    const cashflowRaw = await Cashflow.findAll({
      attributes: [
        [literal('DATE("createdAt")'), "date"],

        "type",

        [fn("SUM", col("amount")), "total"],
      ],

      group: [literal('DATE("createdAt")'), "type"],

      order: [[literal('DATE("createdAt")'), "ASC"]],

      raw: true,
    });

    const grouped = {};

    for (const c of cashflowRaw) {
      const date = c.date;

      const total = Number(c.total) || 0;

      if (!grouped[date]) {
        grouped[date] = {
          date,
          masuk: 0,
          keluar: 0,
        };
      }

      if (c.type === "in") {
        grouped[date].masuk += total;
      }

      if (c.type === "out") {
        grouped[date].keluar += total;
      }
    }

    let cashflow = Object.values(grouped);

    cashflow = fillDates(cashflow, 14);

    // ============================
    // 🔥 CASH BALANCE
    // ============================
    const cashRaw = await Cashflow.findAll({
      attributes: [
        "type",

        [fn("COALESCE", fn("SUM", col("amount")), 0), "total"],
      ],

      group: ["type"],

      raw: true,
    });

    let totalIn = 0;

    let totalOut = 0;

    for (const c of cashRaw) {
      const total = Number(c.total) || 0;

      if (c.type === "in") {
        totalIn += total;
      }

      if (c.type === "out") {
        totalOut += total;
      }
    }

    const cashBalance = totalIn - totalOut;

    // ============================
    // 🔥 ACTIVITIES
    // ============================
    const activitiesRaw = await Cashflow.findAll({
      limit: 10,

      order: [["createdAt", "DESC"]],

      include: [
        {
          model: Loan,

          as: "Loan",

          required: false,

          include: [
            {
              model: Employee,

              as: "Employee",

              attributes: ["name"],

              required: false,
            },
          ],
        },
      ],
    });

    const activities = activitiesRaw.map((item) => {
      const employeeName = item.Loan?.Employee?.name;

      let label = "-";

      if (item.source === "loan") {
        label = "Pinjaman Baru";
      }

      if (item.source === "payment") {
        label = "Pembayaran";
      }

      return {
        id: item.id,

        amount: Number(item.amount) || 0,

        type: item.type,

        source: item.source,

        date: item.createdAt,

        employee: employeeName || label,
      };
    });

    // ============================
    // 🔥 TOP DEBTOR
    // ============================
    const topDebtorsRaw = await Loan.findAll({
      where: {
        status: "ongoing",
      },

      attributes: [
        "employee_id",

        [fn("SUM", col("remaining_amount")), "total"],
      ],

      group: ["employee_id", "Employee.id"],

      order: [[literal("total"), "DESC"]],

      limit: 5,

      include: [
        {
          model: Employee,

          as: "Employee",

          attributes: ["name"],
        },
      ],
    });

    const topDebtors = topDebtorsRaw.map((item) => ({
      name: item.Employee?.name || "-",

      total: Number(item.dataValues.total) || 0,
    }));

    return {
      summary: {
        totalEmployees,

        totalLoan,

        totalRemaining,

        totalPayment,

        activeLoans,

        paidLoans,

        overdueLoans,

        collectionRate: Number(collectionRate.toFixed(2)),

        cashBalance,

        cashIn: totalIn,

        cashOut: totalOut,
      },

      cashflow,

      activities,

      topDebtors,
    };
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);

    throw err;
  }
};

// ============================
// 🔥 MANAGER DASHBOARD
// ============================
const getManagerDashboard = async () => {
  try {
    const [pendingApproval, approvedLoans, rejectedLoans, activeLoans] =
      await Promise.all([
        Loan.count({
          where: {
            status: "pending_manager",
          },
        }),

        Loan.count({
          where: {
            status: "pending_owner",
          },
        }),

        Loan.count({
          where: {
            status: "rejected_manager",
          },
        }),

        Loan.count({
          where: {
            status: "ongoing",
          },
        }),
      ]);

    const pendingApprovalsRaw = await Loan.findAll({
      where: {
        status: "pending_manager",
      },

      include: [
        {
          model: Employee,

          as: "Employee",

          attributes: ["id", "name"],
        },
      ],

      order: [["createdAt", "DESC"]],

      limit: 10,
    });

    const pendingApprovals = pendingApprovalsRaw.map((loan) => ({
      id: loan.id,

      employee: loan.Employee?.name || "-",

      amount: Number(loan.total_amount) || 0,

      remaining: Number(loan.remaining_amount) || 0,

      tenor: loan.tenor || 0,

      status: loan.status,

      createdAt: loan.createdAt,
    }));

    const highRiskRaw = await Loan.findAll({
      where: {
        remaining_amount: {
          [Op.gt]: 0,
        },

        due_date: {
          [Op.lt]: new Date(),
        },

        status: "ongoing",
      },

      include: [
        {
          model: Employee,

          as: "Employee",

          attributes: ["name"],
        },
      ],

      order: [["remaining_amount", "DESC"]],

      limit: 5,
    });

    const highRiskLoans = highRiskRaw.map((loan) => ({
      id: loan.id,

      employee: loan.Employee?.name || "-",

      remaining: Number(loan.remaining_amount) || 0,

      dueDate: loan.due_date,
    }));

    return {
      summary: {
        pendingApproval,

        approvedLoans,

        rejectedLoans,

        activeLoans,
      },

      pendingApprovals,

      highRiskLoans,
    };
  } catch (err) {
    console.error("MANAGER DASHBOARD ERROR:", err);

    throw err;
  }
};

// ============================
// 🔥 OWNER DASHBOARD
// ============================
const getOwnerDashboard = async () => {
  try {
    const [
      totalOutstandingRaw,
      totalDisbursedRaw,
      pendingFinalApproval,
      badLoans,
    ] = await Promise.all([
      Loan.sum("remaining_amount"),

      Loan.sum("total_amount"),

      Loan.count({
        where: {
          status: "pending_owner",
        },
      }),

      Loan.count({
        where: {
          remaining_amount: {
            [Op.gt]: 0,
          },

          due_date: {
            [Op.lt]: new Date(),
          },

          status: "ongoing",
        },
      }),
    ]);

    // ============================
    // 🔥 CASH
    // ============================
    const balance = await cashService.getCashBalance();

    const cashflow = await cashService.getCashflowChart();

    const activities = await cashService.getRecentActivities();

    // ============================
    // 🔥 FINAL APPROVAL
    // ============================
    const approvalsRaw = await Loan.findAll({
      where: {
        status: "pending_owner",
      },

      include: [
        {
          model: Employee,

          as: "Employee",

          attributes: ["name"],
        },
      ],

      order: [["createdAt", "DESC"]],

      limit: 10,
    });

    const finalApprovals = approvalsRaw.map((loan) => ({
      id: loan.id,

      employee: loan.Employee?.name || "-",

      amount: Number(loan.total_amount) || 0,

      tenor: loan.tenor || 0,

      remaining: Number(loan.remaining_amount) || 0,

      createdAt: loan.createdAt,
    }));

    // ============================
    // 🔥 TOP OUTSTANDING
    // ============================
    const topOutstandingRaw = await Loan.findAll({
      where: {
        status: "ongoing",
      },

      attributes: [
        "employee_id",

        [fn("SUM", col("remaining_amount")), "total"],
      ],

      group: ["employee_id", "Employee.id"],

      order: [[literal("total"), "DESC"]],

      limit: 5,

      include: [
        {
          model: Employee,

          as: "Employee",

          attributes: ["name"],
        },
      ],
    });

    const topOutstanding = topOutstandingRaw.map((item) => ({
      employee: item.Employee?.name || "-",

      total: Number(item.dataValues.total) || 0,
    }));

    return {
      summary: {
        totalOutstanding: Number(totalOutstandingRaw) || 0,

        totalDisbursed: Number(totalDisbursedRaw) || 0,

        pendingFinalApproval,

        badLoans,

        cashBalance: balance.balance,

        cashIn: balance.totalIn,

        cashOut: balance.totalOut,
      },

      cashflow,

      activities,

      finalApprovals,

      topOutstanding,
    };
  } catch (err) {
    console.error("OWNER DASHBOARD ERROR:", err);

    throw err;
  }
};

module.exports = {
  getDashboard,

  getManagerDashboard,

  getOwnerDashboard,
};
