const service = require("./employee.service");
const response = require("../../utils/response");

const {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParam,
} = require("./employee.validation");

// 🔥 ambil URL dari supabase (BUKAN filename lagi)
const getFile = (req, field) => {
  return req.files?.[field]?.[0]?.url || null;
};

// ============================
// CREATE
// ============================
exports.createEmployee = async (req, res, next) => {
  try {
    const { error } = createEmployeeSchema.validate(req.body);
    if (error) throw { status: 400, message: error.message };

    const data = await service.createEmployee({
      ...req.body,
      photo: getFile(req, "photo"),
      ktp_photo: getFile(req, "ktp_photo"),
    });

    response.success(res, data, "Employee created");
  } catch (err) {
    next(err);
  }
};

// ============================
// GET ALL
// ============================
exports.getAllEmployees = async (req, res, next) => {
  try {
    const data = await service.getAllEmployees(req.query);
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ============================
// GET DETAIL
// ============================
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { error } = employeeIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    const data = await service.getEmployeeById(req.params.id);
    response.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ============================
// UPDATE (🔥 aman replace)
// ============================
exports.updateEmployee = async (req, res, next) => {
  try {
    const { error: paramError } = employeeIdParam.validate(req.params);
    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError } = updateEmployeeSchema.validate(req.body);
    if (bodyError) throw { status: 400, message: bodyError.message };

    const data = {
      ...req.body,
    };

    // 🔥 hanya set kalau ada file baru
    const photo = getFile(req, "photo");
    const ktp = getFile(req, "ktp_photo");

    if (photo) data.photo = photo;
    if (ktp) data.ktp_photo = ktp;

    const result = await service.updateEmployee(req.params.id, data);

    response.success(res, result, "Employee updated");
  } catch (err) {
    next(err);
  }
};

// ============================
// DELETE
// ============================
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { error } = employeeIdParam.validate(req.params);
    if (error) throw { status: 400, message: error.message };

    await service.deleteEmployee(req.params.id);

    response.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};
