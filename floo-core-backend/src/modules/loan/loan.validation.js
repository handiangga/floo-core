const Joi = require("joi");

// 🔥 CREATE LOAN (LEAN & SAFE)
const createLoanSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),

  principal_amount: Joi.number().integer().min(1).required(),

  interest_rate: Joi.number()
    .min(0)
    .max(50) // 🔥 lebih realistis
    .default(0),

  tenor: Joi.number()
    .integer()
    .min(1)
    .max(24) // 🔥 biar gak ngawur
    .required(),

  type: Joi.string().valid("monthly", "weekly").default("monthly"),
});

// 🔥 UPDATE (STRICT)
const updateLoanSchema = Joi.object({
  interest_rate: Joi.number().min(0).max(50),
}).min(1);

// 🔥 PARAM
const loanIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
};
