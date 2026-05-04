const express = require("express");
const controller = require("./transaction.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");

// ✅ upload middleware
const { upload, processImage } = require("../../middlewares/upload");

// validation
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
// 🔥 CREATE (FIX FINAL 🔥)
// ============================
router.post(
  "/",
  verifyToken,
  rbac(["admin", "owner"]),

  // ✅ ambil file dari form-data
  upload.fields([
    { name: "proof", maxCount: 1 }, // HARUS sama dengan frontend
  ]),

  // ✅ upload ke supabase bucket: transaction
  processImage("transaction"),

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
