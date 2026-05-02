const Joi = require("joi");

// ============================
// 🔥 CREATE LOAN
// ============================
const createLoanSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),

  principal_amount: Joi.number().integer().min(1).required(),

  interest_rate: Joi.number().min(0).max(50).default(0),

  tenor: Joi.number().integer().min(1).max(24).required(),

  type: Joi.string().valid("monthly", "weekly").default("monthly"),
});

// ============================
// 🔥 UPDATE LOAN (FIXED)
// ============================
const updateLoanSchema = Joi.object({
  principal_amount: Joi.number().integer().min(1).optional(),

  interest_rate: Joi.number().min(0).max(50).optional(),

  tenor: Joi.number().integer().min(1).max(24).optional(),
}).min(1);

// ============================
// 🔥 PARAM
// ============================
const loanIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
};
