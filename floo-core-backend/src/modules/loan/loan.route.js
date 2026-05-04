const express = require("express");
const controller = require("./loan.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
} = require("./loan.validation");

const validate = require("../../middlewares/validate.middleware");

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

// owner approve
router.post(
  "/:id/approve-owner",
  verifyToken,
  validate(loanIdParam, "params"),
  rbac(["owner"]),
  controller.approveOwner,
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
