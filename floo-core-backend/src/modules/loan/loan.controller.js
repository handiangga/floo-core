const service = require("./loan.service");
const {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
  rejectSchema,
} = require("./loan.validation");
const response = require("../../utils/response");

// ============================
// 🔥 CREATE
// ============================
exports.createLoan = async (req, res, next) => {
  try {
    const { error, value } = createLoanSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.createLoan(value, req.user || {});

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

    const data = await service.approveByManager(
      Number(req.params.id),
      req.user || {},
    );

    response.success(res, data, "Approved by manager");
  } catch (err) {
    next(err);
  }
};

// ============================
// ❌ REJECT MANAGER
// ============================
exports.rejectManager = async (req, res, next) => {
  try {
    const { error: paramError } = loanIdParam.validate(req.params);
    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError, value } = rejectSchema.validate(req.body);
    if (bodyError) throw { status: 400, message: bodyError.message };

    const data = await service.rejectByManager(
      Number(req.params.id),
      value.reason,
      req.user || {},
    );

    response.success(res, data, "Rejected by manager");
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

    const data = await service.approveByOwner(
      Number(req.params.id),
      req.user || {},
    );

    response.success(res, data, "Approved by owner (waiting signature)");
  } catch (err) {
    next(err);
  }
};

// ============================
// ❌ REJECT OWNER
// ============================
exports.rejectOwner = async (req, res, next) => {
  try {
    const { error: paramError } = loanIdParam.validate(req.params);
    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError, value } = rejectSchema.validate(req.body);
    if (bodyError) throw { status: 400, message: bodyError.message };

    const data = await service.rejectByOwner(
      Number(req.params.id),
      value.reason,
      req.user || {},
    );

    response.success(res, data, "Rejected by owner");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 UPLOAD SIGNED CONTRACT (FIXED 🔥)
// ============================
exports.uploadSignedContract = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    // 🔥 FIX DI SINI
    const fileUrl = req.body.signed_contract;

    if (!fileUrl) {
      throw { status: 400, message: "File TTD wajib diupload" };
    }

    const data = await service.uploadSignedContract(
      Number(req.params.id),
      fileUrl,
    );

    response.success(res, data, "Contract signed successfully");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 DISBURSE
// ============================
exports.disburseLoan = async (req, res, next) => {
  try {
    const { error } = loanIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.disburseLoan(
      Number(req.params.id),
      req.user || {},
    );

    response.success(res, data, "Loan disbursed successfully");
  } catch (err) {
    next(err);
  }
};

// ============================
// 🔥 GET ALL
// ============================
exports.getAllLoans = async (req, res, next) => {
  try {
    const data = await service.getAllLoans(req.user || {});
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

    const data = await service.getLoanById(
      Number(req.params.id),
      req.user || {},
    );

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

    const data = await service.updateLoan(
      Number(req.params.id),
      req.body,
      req.user || {},
    );

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

    await service.deleteLoan(Number(req.params.id), req.user || {});

    response.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};
