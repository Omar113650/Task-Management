import expressValidator from "express-validator";
const { sanitizeBody } = expressValidator;
export const globalSanitizer = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim().replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&#39;";
          case '"': return "&quot;";
          default: return c;
        }
      });
    }
  }
  next();
};
