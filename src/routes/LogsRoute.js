import express from "express";
import { getAllLogs, getUserLogs } from "../controllers/LogsController.js";
import { VerifyToken, VerifyTokenAdmin } from "../middleware/VerifyToken.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { ValidatedID } from "../middleware/validateId.js";

const router = express.Router();
router.get("/get-all-logs", VerifyTokenAdmin, apiLimiter, getAllLogs);
VerifyToken;
router.get(
  "/get-logs-user/:id",
  VerifyToken,
  ValidatedID,
  apiLimiter,
  getUserLogs,
);

export default router;