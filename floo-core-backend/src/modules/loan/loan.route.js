const express = require("express");
const controller = require("./loan.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

// 🔥 SIMULATE (HARUS DI ATAS BIAR GA KETABRAK /:id)
router.post("/simulate", verifyToken, controller.simulateLoan);

// 🔥 GET ALL (CACHE)
router.get("/", verifyToken, cache("loans:"), controller.getAllLoans);

// 🔥 GET DETAIL
router.get("/:id", verifyToken, controller.getLoanById);

// 🔥 CREATE (ADMIN)
router.post("/", verifyToken, rbac(["admin"]), controller.createLoan);

// 🔥 UPDATE (ADMIN)
router.put("/:id", verifyToken, rbac(["admin"]), controller.updateLoan);

// 🔥 DELETE (ADMIN)
router.delete("/:id", verifyToken, rbac(["admin"]), controller.deleteLoan);

module.exports = router;
