const db = require("../../../models");
const redis = require("../../config/redis");
const { Op } = require("sequelize");
const { supabase } = require("../../config/supabase");

const { Employee, Loan } = db;

// 🔥 SAFE REDIS DELETE
const safeRedisDel = async (key) => {
  try {
    if (redis && typeof redis.del === "function") {
      await redis.del(key);
    }
  } catch (err) {
    console.log("⚠️ Redis skip:", err.message);
  }
};

// 🔥 EXTRACT FILE NAME DARI URL SUPABASE
const extractFileName = (url) => {
  if (!url) return null;
  return url.split("/").pop();
};

// 🔥 DELETE FILE DI SUPABASE
const deleteFile = async (url) => {
  try {
    const filename = extractFileName(url);
    if (!filename) return;

    const { error } = await supabase.storage
      .from("employees")
      .remove([filename]);

    if (error) {
      console.log("⚠️ Supabase delete error:", error.message);
    }
  } catch (err) {
    console.log("⚠️ Delete file error:", err.message);
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
// GET ALL (PRO MAX)
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
// UPDATE (🔥 REPLACE IMAGE)
// ============================
const updateEmployee = async (id, data) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw { status: 404, message: "Employee not found" };
  }

  // 🔥 kalau upload foto baru → hapus lama
  if (data.photo && employee.photo) {
    await deleteFile(employee.photo);
  }

  if (data.ktp_photo && employee.ktp_photo) {
    await deleteFile(employee.ktp_photo);
  }

  // 🔥 kalau tidak upload → jangan overwrite null
  if (!data.photo) delete data.photo;
  if (!data.ktp_photo) delete data.ktp_photo;

  await employee.update(data);

  await safeRedisDel("employees");

  return employee;
};

// ============================
// DELETE (🔥 HAPUS FILE JUGA)
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

  // 🔥 hapus file dari supabase
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
