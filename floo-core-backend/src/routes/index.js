const express = require("express");

const employeeRoutes = require("../modules/employee/employee.route");
const loanRoutes = require("../modules/loan/loan.route");
const transactionRoutes = require("../modules/transaction/transaction.route"); // ❗ TANPA .default
const authRoutes = require("../modules/auth/auth.route");
const dashboardRoutes = require("../modules/dashboard/dashboard.route");
const cashRoutes = require("../modules/cash/cash.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/loans", loanRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/cash", cashRoutes);

module.exports = router;
