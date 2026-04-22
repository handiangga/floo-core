const Joi = require("joi");

// CREATE
const createEmployeeSchema = Joi.object({
  name: Joi.string().required(),
  position: Joi.string().required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),

  salary: Joi.number().required(),
  salary_type: Joi.string().valid("weekly", "monthly").required(),
});

// UPDATE
const updateEmployeeSchema = Joi.object({
  name: Joi.string().optional(),
  position: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),

  salary: Joi.number().optional(),
  salary_type: Joi.string().valid("weekly", "monthly").optional(),
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
