const Joi = require("joi");

// 🔥 CREATE (FINAL - PAYMENT ONLY)
const createTransactionSchema = Joi.object({
  loan_id: Joi.number().required(),
  amount: Joi.number().min(1).required(),
});

// 🔥 UPDATE (OPTIONAL - biasanya jarang dipakai)
const updateTransactionSchema = Joi.object({
  amount: Joi.number().min(1).optional(),
}).min(1);

// 🔥 PARAM ID
const transactionIdParam = Joi.object({
  id: Joi.number().required(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParam,
};
