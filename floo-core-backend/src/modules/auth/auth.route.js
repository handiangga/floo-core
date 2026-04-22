const express = require("express");
const controller = require("./auth.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const router = express.Router();

// 🔓 public
router.post("/login", controller.login);

// 🔒 admin only
router.post("/register", verifyToken, rbac(["admin"]), controller.register);

module.exports = router;
