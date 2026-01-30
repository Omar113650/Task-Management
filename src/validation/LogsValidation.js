import Joi from "joi";
import mongoose from "mongoose";

export const validateLog = Joi.object({
  user: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation"),

  action: Joi.string().required(),

  task: Joi.string()
    .allow(null)
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation"),

  description: Joi.string().max(1000).allow(null, ""),

  ipAddress: Joi.string()
    .ip({ version: ["ipv4", "ipv6"] })
    .allow(null, ""),

  statusCode: Joi.number().integer().min(100).allow(null),
});