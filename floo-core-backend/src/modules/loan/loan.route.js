const express = require("express");
const controller = require("./loan.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

// ============================
// 🔥 SIMULATE (HARUS DI ATAS)
// ============================
router.post("/simulate", verifyToken, controller.simulateLoan);

// ============================
// 🔥 APPROVAL FLOW (WAJIB DI ATAS /:id)
// ============================
router.post(
  "/:id/approve-manager",
  verifyToken,
  rbac(["manager"]),
  controller.approveManager,
);

router.post(
  "/:id/approve-owner",
  verifyToken,
  rbac(["admin"]), // owner = admin
  controller.approveOwner,
);

// ============================
// 🔥 GET ALL (CACHE)
// ============================
router.get("/", verifyToken, cache("loans:"), controller.getAllLoans);

// ============================
// 🔥 GET DETAIL
// ============================
router.get("/:id", verifyToken, controller.getLoanById);

// ============================
// 🔥 CREATE (ADMIN)
// ============================
router.post("/", verifyToken, rbac(["admin"]), controller.createLoan);

// ============================
// 🔥 UPDATE (ADMIN)
// ============================
router.put("/:id", verifyToken, rbac(["admin"]), controller.updateLoan);

// ============================
// 🔥 DELETE (ADMIN)
// ============================
router.delete("/:id", verifyToken, rbac(["admin"]), controller.deleteLoan);

module.exports = router;
