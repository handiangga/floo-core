const router = require("express").Router();

const controller = require("./cash.controller");

const {
  verifyToken,
  allowRoles,
} = require("../../middlewares/auth.middleware");

const cache = require("../../middlewares/cache.middleware");

// =====================================================
// 🔥 CASH DASHBOARD
// =====================================================
router.get(
  "/",

  verifyToken,

  allowRoles("admin", "manager", "owner"),

  cache((req) => {
    try {
      const role = req.user?.role || "guest";

      return `cash:${role}`;
    } catch (err) {
      console.log("CASH CACHE ERROR:", err.message);

      return "cash:fallback";
    }
  }),

  controller.getCash,
);

module.exports = router;
