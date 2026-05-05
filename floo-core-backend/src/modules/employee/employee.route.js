const express = require("express");
const controller = require("./employee.controller");
const { upload, processUpload } = require("../../middlewares/upload");
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const router = express.Router();

// ============================
// GET ALL
// ============================
router.get("/", verifyToken, controller.getAllEmployees);

// ============================
// GET DETAIL
// ============================
router.get("/:id", verifyToken, controller.getEmployeeById);

// ============================
// CREATE
// ============================
router.post(
  "/",
  verifyToken,
  rbac(["admin"]),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "ktp_photo", maxCount: 1 },
  ]),
  processUpload("employees"), // 🔥 FIX: HARUS DIPANGGIL
  controller.createEmployee,
);

// ============================
// UPDATE
// ============================
router.put(
  "/:id",
  verifyToken,
  rbac(["admin"]),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "ktp_photo", maxCount: 1 },
  ]),
  processUpload("employees"), // 🔥 FIX
  controller.updateEmployee,
);

// ============================
// DELETE
// ============================
router.delete("/:id", verifyToken, rbac(["admin"]), controller.deleteEmployee);

module.exports = router;
