const service = require("./loan.service");
const {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
} = require("./loan.validation");
const response = require("../../utils/response");

// 🔥 CREATE (FINAL - BACKEND SOURCE OF TRUTH)
exports.createLoan = async (req, res, next) => {
  try {
    const { error } = createLoanSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const { employee_id, amount, interest_rate = 5 } = req.body;

    const data = await service.createLoan({
      employee_id,
      amount,
      interest_rate,
    });

    response.success(res, data, "Loan created");
  } catch (err) {
    next(err);
  }
};

// 🔥 GET ALL
exports.getAllLoans = async (req, res, next) => {
  try {
    const data = await service.getAllLoans(req.query);
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// 🔥 GET DETAIL
exports.getLoanById = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.getLoanById(req.params.id);
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// 🔥 UPDATE (LOCK)
exports.updateLoan = async (req, res, next) => {
  try {
    const { error: paramError } = loanIdParam.validate(req.params);
    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError } = updateLoanSchema.validate(req.body);
    if (bodyError) throw { status: 400, message: bodyError.message };

    const data = await service.updateLoan(req.params.id, req.body);

    response.success(res, data, "Loan updated");
  } catch (err) {
    next(err);
  }
};

// 🔥 DELETE
exports.deleteLoan = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    await service.deleteLoan(req.params.id);

    response.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};

// 🔥 SIMULATE (FE ONLY PREVIEW)
exports.simulateLoan = async (req, res, next) => {
  try {
    const { employee_id, amount, interest_rate = 5 } = req.body;

    const result = await service.simulateLoan({
      employee_id,
      amount,
      interest_rate,
    });

    response.success(res, result);
  } catch (err) {
    next(err);
  }
};
