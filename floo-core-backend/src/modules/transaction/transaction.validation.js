const Joi = require("joi");

// 🔥 CREATE (PAYMENT)
const createTransactionSchema = Joi.object({
  loan_id: Joi.number().integer().required(),

  amount: Joi.number().integer().min(1).required(),

  // optional tapi aman kalau nanti dipakai
  payment_date: Joi.date().optional(),
});

// 🔥 UPDATE
const updateTransactionSchema = Joi.object({
  amount: Joi.number().integer().min(1).optional(),
}).min(1);

// 🔥 PARAM
const transactionIdParam = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParam,
};
