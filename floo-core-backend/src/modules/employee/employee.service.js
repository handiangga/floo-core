const db = require("../../../models");
const redis = require("../../config/redis");
const { Op } = require("sequelize");
const { supabase } = require("../../config/supabase");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const { Employee, Loan } = db;

// ============================
// 🔥 SAFE REDIS DELETE (fallback kalau perlu)
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
// 🔥 EXTRACT FILE PATH
// ============================
const extractFilePath = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    if (!url.includes("supabase")) return null;

    const parts = url.split("/object/public/employees/");
    if (!parts[1]) return null;

    let path = parts[1];

    if (path.startsWith("employees/")) {
      path = path.replace("employees/", "");
    }

    return path;
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

    if (!path) return;

    const { error } = await supabase.storage.from("employees").remove([path]);

    if (error) {
      console.log("❌ Supabase delete error:", error.message);
    }
  } catch (err) {
    console.log("❌ Delete file error:", err.message);
  }
};

// ============================
// CREATE
// ============================
const createEmployee = async (data, user_id = null) => {
  const employee = await Employee.create(data);

  await clearAllCache();

  await logAudit({
    user_id,
    action: "CREATE",
    entity: "employee",
    entity_id: employee.id,
    description: `Create employee ${employee.name}`,
  });

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
// UPDATE (SAFE + TRANSACTION)
// ============================
const updateEmployee = async (id, data, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const employee = await Employee.findByPk(id, { transaction: t });

    if (!employee) {
      throw { status: 404, message: "Employee not found" };
    }

    if (data.photo && data.photo !== employee.photo) {
      await deleteFile(employee.photo);
    }

    if (data.ktp_photo && data.ktp_photo !== employee.ktp_photo) {
      await deleteFile(employee.ktp_photo);
    }

    if (!data.photo) delete data.photo;
    if (!data.ktp_photo) delete data.ktp_photo;

    await employee.update(data, { transaction: t });

    await clearAllCache();

    await logAudit({
      user_id,
      action: "UPDATE",
      entity: "employee",
      entity_id: id,
      description: `Update employee ${employee.name}`,
    });

    return employee;
  });
};

// ============================
// DELETE (SAFE + ATOMIC)
// ============================
const deleteEmployee = async (id, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    const employee = await Employee.findByPk(id, { transaction: t });

    if (!employee) {
      throw { status: 404, message: "Employee not found" };
    }

    const loan = await Loan.findOne({
      where: { employee_id: id },
      transaction: t,
    });

    if (loan) {
      throw {
        status: 400,
        message: "Tidak bisa hapus, karyawan punya riwayat loan",
      };
    }

    // 🔥 delete file dulu
    await deleteFile(employee.photo);
    await deleteFile(employee.ktp_photo);

    await employee.destroy({ transaction: t });

    await clearAllCache();

    await logAudit({
      user_id,
      action: "DELETE",
      entity: "employee",
      entity_id: id,
      description: `Delete employee ${employee.name}`,
    });

    return true;
  });
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
