const Joi = require("joi");

// 🔥 CREATE (FINAL - BACKEND SOURCE OF TRUTH)
const createLoanSchema = Joi.object({
  employee_id: Joi.number().required(),
  amount: Joi.number().min(1).required(),
  interest_rate: Joi.number().min(0).max(100).optional(),

  tenor: Joi.number().min(1).required(), // ✅ TAMBAH INI
});

// 🔥 UPDATE (LOCK CORE FIELD)
const updateLoanSchema = Joi.object({
  interest_rate: Joi.number().min(0).max(100).optional(),
}).min(1);

// 🔥 PARAM ID
const loanIdParam = Joi.object({
  id: Joi.number().required(),
});

module.exports = {
  createLoanSchema,
  updateLoanSchema,
  loanIdParam,
};
