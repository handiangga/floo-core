const service = require("./transaction.service");
const response = require("../../utils/response");

const {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParam,
} = require("./transaction.validation");

// 🔥 CREATE
exports.createTransaction = async (req, res, next) => {
  try {
    const { error } = createTransactionSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.createTransaction({
      loan_id: Number(req.body.loan_id),
      amount: Number(req.body.amount),
      file: req.body.proof || null, // ✅ dari FE (Supabase URL)
    });

    response.success(res, data, "Payment recorded");
  } catch (err) {
    next(err);
  }
};

// 🔥 GET ALL
exports.getAllTransactions = async (req, res, next) => {
  try {
    const data = await service.getAllTransactions({
      ...req.query,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });

    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// 🔥 DETAIL
exports.getTransactionById = async (req, res, next) => {
  try {
    const { error } = transactionIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.getTransactionById(Number(req.params.id));
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// 🔥 UPDATE
exports.updateTransaction = async (req, res, next) => {
  try {
    const { error: paramError } = transactionIdParam.validate(req.params);
    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError } = updateTransactionSchema.validate(req.body);
    if (bodyError) throw { status: 400, message: bodyError.message };

    const data = await service.updateTransaction(Number(req.params.id), {
      amount:
        req.body.amount !== undefined ? Number(req.body.amount) : undefined,
      file: req.body.proof || null, // ✅ URL
    });

    response.success(res, data, "Transaction updated");
  } catch (err) {
    next(err);
  }
};

// 🔥 DELETE
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { error } = transactionIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    await service.deleteTransaction(Number(req.params.id));

    response.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};
