








import asyncHandler from "express-async-handler";
import { Log } from "../model/Logs.js";

// @desc    Get all system logs (with pagination)
// @route   GET /api/logs
// @access  Admin
export const getAllLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const logs = await Log.find()
    .populate("user", "name email")
    .populate("task", "title status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Log.countDocuments();

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    logs,
  });
});

// @desc    Get logs for a specific user
// @route   GET /api/logs/user/:id
// @access  Admin
export const getUserLogs = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const logs = await Log.find({ user: userId })
    .populate("user", "name email")
    .populate("task", "title status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Log.countDocuments({ user: userId });

  if (!logs || logs.length === 0) {
    return res.status(404).json({ message: "No logs found for this user" });
  }

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    logs,
  });
});











