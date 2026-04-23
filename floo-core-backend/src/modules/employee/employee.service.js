const db = require("../../../models");
const redis = require("../../config/redis");
const { Op } = require("sequelize");
const { supabase } = require("../../config/supabase");

const { Employee, Loan } = db;

// ============================
// 🔥 SAFE REDIS DELETE
// ============================
const safeRedisDel = async (key) => {
  try {
    if (redis && typeof redis.del === "function") {
      await redis.del(key);
    }
  } catch (err) {
    console.log("⚠️ Redis skip:", err.message);
  }
};

// ============================
// 🔥 EXTRACT FILE PATH (FINAL FIX)
// ============================
const extractFilePath = (url) => {
  console.log("🧠 URL:", url);
  console.log("🧠 EXTRACT:", extractFilePath(url));
  if (!url || typeof url !== "string") return null;

  try {
    // ambil setelah /object/public/employees/
    const parts = url.split("/object/public/employees/");
    if (!parts[1]) return null;

    let path = parts[1]; // employees/xxx.jpg

    // 🔥 FIX: kalau masih double folder → buang 1 layer
    if (path.startsWith("employees/")) {
      path = path.replace("employees/", "");
    }

    return path; // final: xxx.jpg
  } catch {
    return null;
  }
};

// ============================
// 🔥 DELETE FILE SUPABASE
// ============================
const deleteFile = async (url) => {
  try {
    const path = extractFilePath(url);

    if (!path) {
      console.log("⚠️ Skip delete, invalid URL:", url);
      return;
    }

    console.log("🗑 DELETE PATH:", path);

    const { error } = await supabase.storage.from("employees").remove([path]);

    if (error) {
      console.log("❌ Supabase delete error:", error.message);
    } else {
      console.log("✅ File deleted:", path);
    }
  } catch (err) {
    console.log("❌ Delete file error:", err.message);
  }
};

// ============================
// CREATE
// ============================
const createEmployee = async (data) => {
  const employee = await Employee.create(data);
  await safeRedisDel("employees");
  return employee;
};

// ============================
// GET ALL
// ============================
const getAllEmployees = async ({
  page = 1,
  limit = 10,
  search = "",
  position = "",
}) => {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      { address: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (position) {
    where.position = position;
  }

  const { rows, count } = await Employee.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// ============================
// GET DETAIL
// ============================
const getEmployeeById = async (id) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  return employee;
};

// ============================
// UPDATE (🔥 SAFE REPLACE IMAGE)
// ============================
const updateEmployee = async (id, data) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  // 🔥 hanya hapus kalau benar-benar beda
  if (data.photo && data.photo !== employee.photo) {
    await deleteFile(employee.photo);
  }

  if (data.ktp_photo && data.ktp_photo !== employee.ktp_photo) {
    await deleteFile(employee.ktp_photo);
  }

  // 🔥 jangan overwrite null
  if (!data.photo) delete data.photo;
  if (!data.ktp_photo) delete data.ktp_photo;

  await employee.update(data);

  await safeRedisDel("employees");

  return employee;
};

// ============================
// DELETE (🔥 CLEAN STORAGE)
// ============================
const deleteEmployee = async (id) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  const loan = await Loan.findOne({
    where: { employee_id: id },
  });

  if (loan) {
    throw {
      status: 400,
      message: "Tidak bisa hapus, karyawan punya riwayat loan",
    };
  }

  // 🔥 hapus file dari storage
  await deleteFile(employee.photo);
  await deleteFile(employee.ktp_photo);

  await employee.destroy();

  await safeRedisDel("employees");

  return true;
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
