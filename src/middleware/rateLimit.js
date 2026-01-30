import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1m
  max: 5,
  message: {
    message: "Too many requests from this IP, please try again after 1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


