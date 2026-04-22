const express = require("express");
const controller = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, controller.getDashboard);

module.exports = router;
