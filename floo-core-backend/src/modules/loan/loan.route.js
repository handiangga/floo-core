const express = require("express");
const controller = require("./loan.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
  rejectSchema,
} = require("./loan.validation");

const validate = require("../../middlewares/validate.middleware");

// 🔥 FIX DI SINI
const { upload, processUpload } = require("../../middlewares/upload");

const router = express.Router();

// ============================
// 🔥 SIMULATE
// ============================
router.post(
  "/simulate",
  verifyToken,
  validate(createLoanSchema),
  controller.simulateLoan,
);

// ============================
// 🔥 APPROVAL FLOW
// ============================

// manager approve
router.post(
  "/:id/approve-manager",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["manager"]),
  controller.approveManager,
);

// manager reject
router.post(
  "/:id/reject-manager",
  verifyToken,
  validate(loanIdParam, "params"),
  validate(rejectSchema),
  rbac(["manager"]),
  controller.rejectManager,
);

// owner approve
router.post(
  "/:id/approve-owner",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["owner"]),
  controller.approveOwner,
);

// owner reject
router.post(
  "/:id/reject-owner",
  verifyToken,
  validate(loanIdParam, "params"),
  validate(rejectSchema),
  rbac(["owner"]),
  controller.rejectOwner,
);

// ============================
// 🔥 SIGNATURE FLOW
// ============================

// upload TTD
router.post(
  "/:id/upload-contract",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["admin"]),
  upload.fields([{ name: "signed_contract", maxCount: 1 }]),
  processUpload("contracts"), // 🔥 FIX
  controller.uploadSignedContract,
);

// disburse
router.post(
  "/:id/disburse",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["admin"]),
  controller.disburseLoan,
);

// ============================
// 🔥 GET ALL
// ============================
router.get(
  "/",
  verifyToken,
  rbac(["admin", "manager", "owner"]),
  controller.getAllLoans,
);

// ============================
// 🔥 GET DETAIL
// ============================
router.get(
  "/:id",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["admin", "manager", "owner"]),
  controller.getLoanById,
);

// ============================
// 🔥 CREATE
// ============================
router.post(
  "/",
  verifyToken,
  validate(createLoanSchema),
  rbac(["admin"]),
  controller.createLoan,
);

// ============================
// 🔥 UPDATE
// ============================
router.put(
  "/:id",
  verifyToken,
  validate(loanIdParam, "params"),
  validate(updateLoanSchema),
  rbac(["admin"]),
  controller.updateLoan,
);

// ============================
// 🔥 DELETE
// ============================
router.delete(
  "/:id",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["admin"]),
  controller.deleteLoan,
);

module.exports = router;
