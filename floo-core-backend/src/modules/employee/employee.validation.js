const Joi = require("joi");

// 🔥 HELPER: normalize number (support 2.000.000)
const parseNumber = (value, helpers) => {
  if (typeof value === "string") {
    const cleaned = value.replace(/\./g, "").replace(/,/g, "");
    const num = Number(cleaned);

    if (isNaN(num)) {
      return helpers.error("number.base");
    }

    return num;
  }

  return value;
};

// ============================
// CREATE
// ============================
const createEmployeeSchema = Joi.object({
  name: Joi.string().required(),

  position: Joi.string().required(),

  phone: Joi.string().allow("", null),

  address: Joi.string().allow("", null),

  salary: Joi.number().custom(parseNumber, "parse number").required().messages({
    "number.base": "Gaji harus berupa angka",
    "any.required": "Gaji wajib diisi",
  }),

  salary_type: Joi.string().valid("weekly", "monthly").required().messages({
    "any.only": "Tipe gaji harus weekly / monthly",
    "any.required": "Tipe gaji wajib diisi",
  }),

  // 🔥 FILE (dari supabase)
  photo: Joi.string().uri().allow("", null),

  ktp_photo: Joi.string().uri().allow("", null),
});

// ============================
// UPDATE
// ============================
const updateEmployeeSchema = Joi.object({
  name: Joi.string().optional(),

  position: Joi.string().optional(),

  phone: Joi.string().allow("", null),

  address: Joi.string().allow("", null),

  salary: Joi.number().custom(parseNumber, "parse number").optional(),

  salary_type: Joi.string().valid("weekly", "monthly").optional(),

  photo: Joi.string().uri().allow("", null),

  ktp_photo: Joi.string().uri().allow("", null),
});

// ============================
// PARAM
// ============================
const employeeIdParam = Joi.object({
  id: Joi.number().required(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParam,
};
