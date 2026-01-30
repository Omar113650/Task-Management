import express from "express";
import {
  CountUser,
  getAllUser,
  getUserTasks,
  AddTaskFeedback,
  updateTaskState,
  updateTask,
  deleteTask,
} from "../controllers/AdminDashboard.js";
import { VerifyTokenAdmin } from "../middleware/VerifyToken.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { ValidatedID } from "../middleware/validateId.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.get("/count-user", VerifyTokenAdmin, apiLimiter, CountUser);
router.get("/all-user", VerifyTokenAdmin, apiLimiter, getAllUser);
router.get("/user-tasks", VerifyTokenAdmin, apiLimiter, getUserTasks);
router.patch(
  "/task-feedback/:id",
  VerifyTokenAdmin,
  ValidatedID,
  AddTaskFeedback,
);
router.patch("/task-state/:id", VerifyTokenAdmin, ValidatedID, updateTaskState);
router.put(
  "/update-task/:id",
  VerifyTokenAdmin,
  ValidatedID,
  upload.single("attachment"),
  updateTask,
);
router.delete("/delete-task/:id", VerifyTokenAdmin, ValidatedID, deleteTask);

export default router;
