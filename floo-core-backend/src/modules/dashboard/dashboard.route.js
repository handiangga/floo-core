const express = require("express");
const controller = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  cache((req) => {
    const role = req.user?.role || "guest";

    const start = req.query.start_date || "all";
    const end = req.query.end_date || "all";

    return `dashboard:${role}:${start}:${end}`;
  }),
  controller.getDashboard,
);

module.exports = router;
