const Joi = require("joi");

// ============================
// 🔥 OPTIONS (STRICT MODE)
// ============================
const options = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
};

// ============================
// 🔥 CREATE TRANSACTION
// ============================
const createTransactionSchema = Joi.object({
  loan_id: Joi.number().integer().positive().required(),

  amount: Joi.number()
    .integer()
    .min(1)
    .max(1000000000) // 🔥 guard max
    .required(),

  proof: Joi.string().uri().optional().allow(null, ""),

  // 🔒 forbid field manipulasi
  remaining_after: Joi.forbidden(),
  type: Joi.forbidden(),
  payment_date: Joi.forbidden(),
});

// ============================
// 🔥 UPDATE TRANSACTION
// ============================
// 👉 biasanya disable di service, tapi tetap aman
const updateTransactionSchema = Joi.object({
  amount: Joi.number().integer().min(1).max(1000000000),

  proof: Joi.string().uri().optional().allow(null, ""),
})
  .min(1)
  .unknown(false);

// ============================
// 🔥 PARAM ID
// ============================
const transactionIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ============================
module.exports = {
  createTransactionSchema: createTransactionSchema.options(options),
  updateTransactionSchema: updateTransactionSchema.options(options),
  transactionIdParam,
};
