const service = require("./employee.service");
const response = require("../../utils/response");

const {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParam,
} = require("./employee.validation");

// ============================
// CREATE
// ============================
exports.createEmployee = async (req, res, next) => {
  try {
    // 🔥 FIX: pakai convert + value (WAJIB)
    const { error, value } = createEmployeeSchema.validate(req.body, {
      convert: true,
    });

    if (error) throw { status: 400, message: error.message };

    console.log("📥 CREATE BODY:", value);

    const data = await service.createEmployee(value);

    return response.success(res, data, "Employee created");
  } catch (err) {
    console.error("❌ CREATE CTRL ERROR:", err);
    return next(err);
  }
};

// ============================
// GET ALL
// ============================
exports.getAllEmployees = async (req, res, next) => {
  try {
    const data = await service.getAllEmployees(req.query);
    return response.success(res, data);
  } catch (err) {
    console.error("❌ GET ALL ERROR:", err);
    return next(err);
  }
};

// ============================
// GET DETAIL
// ============================
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { error, value } = employeeIdParam.validate(req.params, {
      convert: true,
    });

    if (error) throw { status: 400, message: error.message };

    const data = await service.getEmployeeById(value.id);

    return response.success(res, data);
  } catch (err) {
    console.error("❌ GET DETAIL ERROR:", err);
    return next(err);
  }
};

// ============================
// UPDATE
// ============================
exports.updateEmployee = async (req, res, next) => {
  try {
    const { error: paramError, value: paramVal } = employeeIdParam.validate(
      req.params,
      { convert: true },
    );

    if (paramError) throw { status: 400, message: paramError.message };

    const { error: bodyError, value: bodyVal } = updateEmployeeSchema.validate(
      req.body,
      {
        convert: true,
      },
    );

    if (bodyError) throw { status: 400, message: bodyError.message };

    console.log("📥 UPDATE BODY:", bodyVal);

    const result = await service.updateEmployee(paramVal.id, bodyVal);

    return response.success(res, result, "Employee updated");
  } catch (err) {
    console.error("❌ UPDATE ERROR:", err);
    return next(err);
  }
};

// ============================
// DELETE
// ============================
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { error, value } = employeeIdParam.validate(req.params, {
      convert: true,
    });

    if (error) throw { status: 400, message: error.message };

    await service.deleteEmployee(value.id);

    return response.success(res, null, "Deleted successfully");
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    return next(err);
  }
};
