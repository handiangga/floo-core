const Joi = require("joi");

// CREATE
const createEmployeeSchema = Joi.object({
  name: Joi.string().required(),
  position: Joi.string().required(),
  phone: Joi.string().allow("", null),
  address: Joi.string().allow("", null),

  salary: Joi.number().required(),
  salary_type: Joi.string().valid("weekly", "monthly").required(),

  // 🔥 TAMBAHAN WAJIB (SUPABASE FILE)
  photo: Joi.string().allow("", null),
  ktp_photo: Joi.string().allow("", null),
});

// UPDATE
const updateEmployeeSchema = Joi.object({
  name: Joi.string().optional(),
  position: Joi.string().optional(),
  phone: Joi.string().allow("", null),
  address: Joi.string().allow("", null),

  salary: Joi.number().optional(),
  salary_type: Joi.string().valid("weekly", "monthly").optional(),

  // 🔥 TAMBAHAN WAJIB
  photo: Joi.string().allow("", null),
  ktp_photo: Joi.string().allow("", null),
});

// PARAM
const employeeIdParam = Joi.object({
  id: Joi.number().required(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParam,
};
