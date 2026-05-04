const express = require("express");
const controller = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,

  // 🔥 SAFE CACHE (tidak akan bikin hang)
  cache((req) => {
    try {
      const role = req.user?.role || "guest";
      const start = req.query.start_date || "all";
      const end = req.query.end_date || "all";

      return `dashboard:${role}:${start}:${end}`;
    } catch (err) {
      console.log("CACHE KEY ERROR:", err.message);
      return "dashboard:fallback";
    }
  }),

  controller.getDashboard,
);

module.exports = router;
