const Joi = require("joi");

const options = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
};

// ============================
// CREATE
// ============================
const createLoanSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),

  principal_amount: Joi.number().integer().min(1).max(1000000000).required(),

  interest_rate: Joi.number().min(0).max(50).default(0),

  tenor: Joi.number().integer().min(1).max(24).required(),

  type: Joi.forbidden(),
  status: Joi.forbidden(),
  total_amount: Joi.forbidden(),
  remaining_amount: Joi.forbidden(),
}).options(options);

// ============================
// UPDATE
// ============================
const updateLoanSchema = Joi.object({
  principal_amount: Joi.number().integer().min(1).max(1000000000),
  interest_rate: Joi.number().min(0).max(50),
  tenor: Joi.number().integer().min(1).max(24),
})
  .min(1)
  .unknown(false)
  .options(options);

// ============================
// PARAM
// ============================
const loanIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ============================
// REJECT
// ============================
const rejectSchema = Joi.object({
  reason: Joi.string().min(3).max(255).required(),
}).options(options);

// ============================
// SIMULATE
// ============================
const simulateLoanSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),
  principal_amount: Joi.number().integer().min(1).required(),
  interest_rate: Joi.number().min(0).max(50).default(0),
  tenor: Joi.number().integer().min(1).max(24).required(),
}).options(options);

// ============================
// EXPORT
// ============================
module.exports = {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
  rejectSchema,
  simulateLoanSchema,
};
