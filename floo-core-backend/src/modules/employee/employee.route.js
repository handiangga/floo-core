const express = require("express");
const controller = require("./employee.controller");
const { upload, processImage } = require("../../middlewares/upload"); // ✅ FIX
const { verifyToken } = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const router = express.Router();

// GET ALL
router.get("/", verifyToken, controller.getAllEmployees);

// GET DETAIL
router.get("/:id", verifyToken, controller.getEmployeeById);

// CREATE
router.post(
  "/",
  verifyToken,
  rbac(["admin"]),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "ktp_photo", maxCount: 1 },
  ]),
  processImage, // 🔥 INI WAJIB
  controller.createEmployee,
);

//EDIT
router.put(
  "/:id",
  verifyToken,
  rbac(["admin"]),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "ktp_photo", maxCount: 1 },
  ]),
  processImage, // 🔥 INI WAJIB
  controller.updateEmployee,
);

// DELETE
router.delete("/:id", verifyToken, rbac(["admin"]), controller.deleteEmployee);

module.exports = router;
