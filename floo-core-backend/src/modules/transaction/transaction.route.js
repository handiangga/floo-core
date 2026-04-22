const express = require("express");
const controller = require("./transaction.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");
const { upload, processImage } = require("../../middlewares/upload");

const router = express.Router();

// 🔥 GET ALL (CACHE)
router.get(
  "/",
  verifyToken,
  cache("transactions:"),
  controller.getAllTransactions,
);

// 🔥 GET DETAIL
router.get("/:id", verifyToken, controller.getTransactionById);

// 🔥 CREATE (PAYMENT)
router.post(
  "/",
  verifyToken,
  rbac(["admin", "operator"]),
  upload.fields([{ name: "proof", maxCount: 1 }]),
  processImage,
  controller.createTransaction,
);

// 🔥 UPDATE
router.put(
  "/:id",
  verifyToken,
  rbac(["admin"]),
  upload.fields([{ name: "proof", maxCount: 1 }]),
  processImage,
  controller.updateTransaction,
);

// 🔥 DELETE
router.delete(
  "/:id",
  verifyToken,
  rbac(["admin"]),
  controller.deleteTransaction,
);

module.exports = router;
