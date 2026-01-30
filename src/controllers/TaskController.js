import asyncHandler from "express-async-handler";
import { Task } from "../model/Task.js";
import { cloudinaryUploadFile } from "../utils/Cloudinary.js";
import { Log } from "../model/Logs.js";

// @desc    Create new task with attachment
// @route   POST /api/tasks
// @access  Private (Admin)
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo } = req.body;
  const user = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "Product image is required" });
  }

  const uploadResult = await cloudinaryUploadFile(req.file.buffer);
  if (!uploadResult?.secure_url) {
    return res
      .status(500)
      .json({ message: "Failed to upload attachment to Cloudinary" });
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    user,
    attachment: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
    status: "pending",
  });

  await Log.create({
    user: req.user.id,
    action: "create-task",
    task: task._id,
    description: `Task "${title}" created`,
    ipAddress: req.ip,
    statusCode: 201,
  });

  res.status(201).json({
    message: "Task created successfully",
    task,
  });
});

// @desc    Get all tasks[pagination]
// @route   GET /api/tasks
// @access  Admin
export const getAllTasks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!tasks || tasks.length === 0) {
    return res.status(404).json({ message: "No tasks found" });
  }

  await Log.create({
    user: req.user.id,
    action: "Get-All-Task",
    task: tasks._id,
    description: `Task "${title}"`,
    ipAddress: req.ip,
    statusCode: 200,
  });

  res.status(200).json({
    tasks,
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private (Admin or  User)
export const getTaskById = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json({
    task,
  });
});

// @desc    // @desc    Get Task To Each User
// @route   GET /api/tasks/my-tasks
// @access  user
export const getMyTasks = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;

  const tasks = await Task.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Task.countDocuments(query);

  await Log.create({
    user: req.user.id,
    action: "get-Task-this-user",
    task: tasks._id,
    description: `Task "${action}" `,
    ipAddress: req.ip,
    statusCode: 201,
  });
  res.status(200).json({
    count: tasks.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    tasks,
  });
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  user
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const UpdateStatus = await Task.findByIdAndUpdate(
    id,
    {
      $set: {
        status: task || task.status,
      },
    },
    { new: true },
  );
  task.status = status;

  await Log.create({
    user: req.user.id,
    action: "Update-Status-Task",
    task: task._id,
    description: `Task "${status}" `,
    ipAddress: req.ip,
    statusCode: 201,
  });

  res.status(200).json({
    message: `Task status updated to ${status}`,
    task: UpdateStatus,
  });
});




