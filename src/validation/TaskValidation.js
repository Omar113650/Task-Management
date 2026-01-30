import Joi from "joi";
import mongoose from "mongoose";

export const validateTask = Joi.object({
  title: Joi.string().min(3).max(100).required(),

  description: Joi.string().min(5).max(1000).required(),

  status: Joi.string()
    .valid("pending", "in_progress", "completed")
    .default("pending"),

  attachment: Joi.object({
    url: Joi.string().uri().allow(""),
    publicId: Joi.string().allow(null),
  }).default({ url: "", publicId: null }),

  feedback: Joi.string().max(1000).allow(null, ""),

  assignedTo: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }),

  user: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }),
});