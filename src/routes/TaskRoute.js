import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  getMyTasks,
  updateTaskStatus,
} from "../controllers/TaskController.js";
import { VerifyToken, VerifyTokenAdmin } from "../middleware/VerifyToken.js";
import { validateTask } from "../validation/TaskValidation.js";
import upload from "../utils/multer.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { ValidatedID } from "../middleware/validateId.js";
import { validate } from "../middleware/validate.js";
const router = express.Router();

router.post(
  "/create-task",
  VerifyTokenAdmin,
  validate(validateTask),
  upload.single("attachment"),
  createTask,
);
router.get("/all-task", VerifyTokenAdmin, apiLimiter, getAllTasks);

router.get("/my-tasks", VerifyToken, apiLimiter, getMyTasks);

router.get("/get-task/:id", VerifyToken, ValidatedID, apiLimiter, getTaskById);

router.patch("/change-status/:id", VerifyToken, ValidatedID, updateTaskStatus);

export default router;
