const db = require("../../../models");
const { Op } = require("sequelize");
const { supabase } = require("../../config/supabase");

const { clearAllCache } = require("../../utils/cache");
const { logAudit } = require("../../utils/audit");

const { Employee, Loan } = db;

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
// 🔥 DELETE FILE SUPABASE (SAFE)
// ============================
const deleteFile = async (url) => {
  try {
    const path = extractFilePath(url);
    if (!path) return;

    const { error } = await supabase.storage.from("employees").remove([path]);

    if (error) {
      console.log("⚠️ Supabase delete error:", error.message);
    }
  } catch (err) {
    console.log("⚠️ Delete file error:", err.message);
  }
};

// ============================
// CREATE (🔥 ANTI HANG)
// ============================
const createEmployee = async (data, user_id = null) => {
  try {
    console.log("🔥 CREATE PAYLOAD:", data);

    const employee = await Employee.create(data);

    console.log("✅ CREATE SUCCESS:", employee.id);

    // 🔥 NON-BLOCKING (JANGAN AWAIT)
    clearAllCache().catch((err) => console.log("⚠️ Cache error:", err.message));

    logAudit({
      user_id,
      action: "CREATE",
      entity: "employee",
      entity_id: employee.id,
      description: `Create employee ${employee.name}`,
    }).catch((err) => console.log("⚠️ Audit error:", err.message));

    return employee;
  } catch (err) {
    console.error("💥 CREATE ERROR:", err);

    throw {
      status: 500,
      message: err.message || "Gagal create employee",
    };
  }
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
  try {
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

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
    };
  } catch (err) {
    console.error("💥 GET ALL ERROR:", err);
    throw {
      status: 500,
      message: err.message || "Gagal ambil data",
    };
  }
};

// ============================
// GET DETAIL
// ============================
const getEmployeeById = async (id) => {
  try {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      throw { status: 404, message: "Employee not found" };
    }

    return employee;
  } catch (err) {
    console.error("💥 GET DETAIL ERROR:", err);
    throw err;
  }
};

// ============================
// UPDATE (SAFE + TRANSACTION)
// ============================
const updateEmployee = async (id, data, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    try {
      const employee = await Employee.findByPk(id, { transaction: t });

      if (!employee) {
        throw { status: 404, message: "Employee not found" };
      }

      // 🔥 DELETE OLD FILE
      if (data.photo && data.photo !== employee.photo) {
        await deleteFile(employee.photo);
      }

      if (data.ktp_photo && data.ktp_photo !== employee.ktp_photo) {
        await deleteFile(employee.ktp_photo);
      }

      // 🔥 JANGAN TIMPA NULL
      if (!data.photo) delete data.photo;
      if (!data.ktp_photo) delete data.ktp_photo;

      await employee.update(data, { transaction: t });

      clearAllCache().catch(() => {});

      logAudit({
        user_id,
        action: "UPDATE",
        entity: "employee",
        entity_id: id,
        description: `Update employee ${employee.name}`,
      }).catch(() => {});

      return employee;
    } catch (err) {
      console.error("💥 UPDATE ERROR:", err);
      throw err;
    }
  });
};

// ============================
// DELETE (SAFE)
// ============================
const deleteEmployee = async (id, user_id = null) => {
  return await db.sequelize.transaction(async (t) => {
    try {
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
          message: "Tidak bisa hapus, karyawan punya loan",
        };
      }

      await deleteFile(employee.photo);
      await deleteFile(employee.ktp_photo);

      await employee.destroy({ transaction: t });

      clearAllCache().catch(() => {});

      logAudit({
        user_id,
        action: "DELETE",
        entity: "employee",
        entity_id: id,
        description: `Delete employee ${employee.name}`,
      }).catch(() => {});

      return true;
    } catch (err) {
      console.error("💥 DELETE ERROR:", err);
      throw err;
    }
  });
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
