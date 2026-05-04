const express = require("express");
const controller = require("./transaction.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");

// 🔥 VALIDATION
const { transactionIdParam } = require("./transaction.validation");

const validate = require("../../middlewares/validate.middleware");

const router = express.Router();

// ============================
// 🔥 GET ALL
// ============================
router.get(
  "/",
  verifyToken,
  cache(
    (req) =>
      `transactions:${req.query.loan_id || "all"}:${req.query.page || 1}`,
  ),
  controller.getAllTransactions,
);

// ============================
// 🔥 DETAIL
// ============================
router.get(
  "/:id",
  verifyToken,
  validate(transactionIdParam, "params"),
  controller.getTransactionById,
);

// ============================
// 🔥 CREATE
// ============================
router.post(
  "/",
  verifyToken,
  rbac(["admin", "owner"]),
  controller.createTransaction,
);

// ============================
// 🔥 DELETE
// ============================
router.delete(
  "/:id",
  verifyToken,
  validate(transactionIdParam, "params"),
  rbac(["admin"]),
  controller.deleteTransaction,
);

module.exports = router;
