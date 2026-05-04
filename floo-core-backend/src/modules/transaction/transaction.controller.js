const service = require("./transaction.service");
const response = require("../../utils/response");

const {
  createTransactionSchema,
  transactionIdParam,
} = require("./transaction.validation");

// ============================
// 🔥 CREATE
// ============================
exports.createTransaction = async (req, res, next) => {
  try {
    const { error } = createTransactionSchema.validate(req.body);

    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }

    const data = await service.createTransaction({
      loan_id: Number(req.body.loan_id),
      amount: Number(req.body.amount),
      proof: req.body.proof || null, // ✅ FIX
      user: req.user, // ✅ FIX
    });

    response.success(res, data, "Payment recorded");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 GET ALL
// ============================
exports.getAllTransactions = async (req, res, next) => {
  try {
    const data = await service.getAllTransactions({
      ...req.query,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      user: req.user, // 🔥 optional RBAC
    });

    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 DETAIL
// ============================
exports.getTransactionById = async (req, res, next) => {
  try {
    const { error } = transactionIdParam.validate(req.params);

    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }

    const data = await service.getTransactionById(Number(req.params.id));

    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 DELETE
// ============================
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { error } = transactionIdParam.validate(req.params);

    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }

    await service.deleteTransaction(Number(req.params.id), req.user); // ✅ FIX

    response.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};
