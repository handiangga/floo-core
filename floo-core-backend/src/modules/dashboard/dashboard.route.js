const express = require("express");
const controller = require("./dashboard.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");

const cache = require("../../middlewares/cache.middleware");

const router = express.Router();

// ======================================================
// 🔥 ADMIN (EXISTING)
// ======================================================
router.get(
  "/",
  verifyToken,

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

// ======================================================
// 🔥 MANAGER
// ======================================================
router.get(
  "/manager",
  verifyToken,

  cache((req) => {
    const role = req.user?.role || "guest";

    return `dashboard:manager:${role}`;
  }),

  controller.getManagerDashboard,
);

// ======================================================
// 🔥 OWNER
// ======================================================
router.get(
  "/owner",
  verifyToken,

  cache((req) => {
    const role = req.user?.role || "guest";

    return `dashboard:owner:${role}`;
  }),

  controller.getOwnerDashboard,
);

module.exports = router;
