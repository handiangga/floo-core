const express = require("express");

const controller = require("./transaction.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");

const rbac = require("../../middlewares/rbac.middleware");

const cache = require("../../middlewares/cache.middleware");

// 🔥 upload middleware
const { upload, processUpload } = require("../../middlewares/upload");

// 🔥 validation
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
// 🔥 CREATE PAYMENT
// ============================
router.post(
  "/",

  verifyToken,

  rbac(["admin", "owner"]),

  // 🔥 upload bukti pembayaran
  upload.fields([
    {
      name: "proof",
      maxCount: 1,
    },
  ]),

  // 🔥 upload ke supabase storage
  processUpload("transaction"),

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
