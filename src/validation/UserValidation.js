import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

export const validateUser = Joi.object({
  name: Joi.string().min(3).max(50).required(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .trim(),

  password: PasswordComplexity().required(),

  role: Joi.string().valid("Admin", "User").default("User"),
});




