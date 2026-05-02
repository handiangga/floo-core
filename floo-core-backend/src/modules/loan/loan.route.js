const express = require("express");
const controller = require("./loan.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const router = express.Router();

// ============================
// 🔥 SIMULATE
// ============================
router.post("/simulate", verifyToken, controller.simulateLoan);

// ============================
// 🔥 APPROVAL FLOW
// ============================
router.post(
  "/:id/approve-manager",
  verifyToken,
  rbac(["manager"]),
  controller.approveManager
);

router.post(
  "/:id/approve-owner",
  verifyToken,
  rbac(["owner"]),
  controller.approveOwner
);

// ============================
// 🔥 GET ALL
// ============================
router.get("/", verifyToken, controller.getAllLoans);

// ============================
// 🔥 GET DETAIL
// ============================
router.get("/:id", verifyToken, controller.getLoanById);

// ============================
// 🔥 CREATE
// ============================
router.post("/", verifyToken, rbac(["admin"]), controller.createLoan);

// ============================
// 🔥 UPDATE
// ============================
router.put("/:id", verifyToken, rbac(["admin"]), controller.updateLoan);

// ============================
// 🔥 DELETE
// ============================
router.delete("/:id", verifyToken, rbac(["admin"]), controller.deleteLoan);

module.exports = router;