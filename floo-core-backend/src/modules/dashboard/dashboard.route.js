const express = require("express");
const controller = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  cache("dashboard:"), // 🔥 TAMBAH INI
  controller.getDashboard,
);

module.exports = router;
