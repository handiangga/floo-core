const Joi = require("joi");

// 🔥 CREATE
const createTransactionSchema = Joi.object({
  loan_id: Joi.number().required(),
  amount: Joi.number().min(1).required(),

  // ✅ TAMBAH INI
  proof: Joi.string().uri().optional().allow(null, ""),
});

// 🔥 UPDATE
const updateTransactionSchema = Joi.object({
  amount: Joi.number().min(1).optional(),

  // ✅ TAMBAH JUGA
  proof: Joi.string().uri().optional().allow(null, ""),
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
