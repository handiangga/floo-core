const express = require("express");
const controller = require("./transaction.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

// 🔥 GET ALL
router.get(
  "/",
  verifyToken,
  cache("transactions:"),
  controller.getAllTransactions,
);

// 🔥 DETAIL
router.get("/:id", verifyToken, controller.getTransactionById);

// 🔥 CREATE
router.post(
  "/",
  verifyToken,
  rbac(["admin", "operator"]),
  controller.createTransaction,
);

// 🔥 UPDATE
router.put("/:id", verifyToken, rbac(["admin"]), controller.updateTransaction);

// 🔥 DELETE
router.delete(
  "/:id",
  verifyToken,
  rbac(["admin"]),
  controller.deleteTransaction,
);

module.exports = router;
