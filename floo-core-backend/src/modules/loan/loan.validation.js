const Joi = require("joi");

// ============================
// 🔥 BASE OPTIONS (STRICT)
// ============================
const options = {
  abortEarly: false,
  allowUnknown: false, // 🔥 tolak field liar
  stripUnknown: true, // 🔥 buang field aneh
};

// ============================
// 🔥 CREATE LOAN
// ============================
const createLoanSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),

  principal_amount: Joi.number()
    .integer()
    .min(1)
    .max(1000000000) // optional guard
    .required(),

  interest_rate: Joi.number().min(0).max(50).default(0),

  tenor: Joi.number().integer().min(1).max(24).required(),

  // 🔥 jangan boleh di-set dari FE
  type: Joi.forbidden(),
  status: Joi.forbidden(),
  total_amount: Joi.forbidden(),
  remaining_amount: Joi.forbidden(),
});

// ============================
// 🔥 UPDATE LOAN
// ============================
const updateLoanSchema = Joi.object({
  principal_amount: Joi.number().integer().min(1).max(1000000000),

  interest_rate: Joi.number().min(0).max(50),

  tenor: Joi.number().integer().min(1).max(24),
})
  .min(1) // 🔥 minimal 1 field harus ada
  .unknown(false); // 🔥 tolak field lain

// ============================
// 🔥 PARAM
// ============================
const loanIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ============================
// 🔥 EXPORT WITH OPTIONS
// ============================
module.exports = {
  createLoanSchema: createLoanSchema.options(options),
  updateLoanSchema: updateLoanSchema.options(options),
  loanIdParam,
};
