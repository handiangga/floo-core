const service = require("./loan.service");
const {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
} = require("./loan.validation");
const response = require("../../utils/response");

// ============================
// 🔥 CREATE
// ============================
exports.createLoan = async (req, res, next) => {
  try {
    const { error, value } = createLoanSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.createLoan({
      ...value,
      user_id: req.user?.id || null,
    });

    response.success(res, data, "Loan created (pending approval)");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 APPROVE MANAGER
// ============================
exports.approveManager = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.approveByManager(req.params.id, req.user.id);

    response.success(res, data, "Approved by manager");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 APPROVE OWNER
// ============================
exports.approveOwner = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.approveByOwner(req.params.id, req.user.id);

    response.success(res, data, "Approved by owner");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 GET ALL
// ============================
exports.getAllLoans = async (req, res, next) => {
  try {
    const data = await service.getAllLoans();
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 GET DETAIL
// ============================
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

// ============================
// 🔥 UPDATE
// ============================
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

// ============================
// 🔥 DELETE
// ============================
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

// ============================
// 🔥 SIMULATE
// ============================
exports.simulateLoan = async (req, res, next) => {
  try {
    const { error, value } = createLoanSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const result = await service.simulateLoan(value);

    response.success(res, result);
  } catch (err) {
    next(err);
  }
};
