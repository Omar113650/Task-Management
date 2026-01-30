import asyncHandler from "express-async-handler";
import { Task } from "../model/Task.js";
import { User } from "../model/User.js";
import {
  cloudinaryUploadFile,
  cloudinaryRemoveFile,
} from "../utils/Cloudinary.js";
import { Log } from "../model/Logs.js";

// @desc    Get total users count
// @route   GET /api/users/count
// @access  Admin
export const CountUser = asyncHandler(async (req, res) => {
  const count_user = await User.countDocuments();

  if (!count_user) {
    return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json({
    count: count_user,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-Password");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json({
    users,
  });
});

// @desc    Get all tasks assigned to user
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getUserTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const tasks = await Task.find({ assignedTo: userId }).populate(
    "assignedTo",
    "name email",
  );

  if (!tasks || tasks.length === 0) {
    return res.status(404).json({ message: "No tasks assigned to this user" });
  }

  res.status(200).json({
    tasks,
  });
});

// @desc    Add feedback to a task
// @route   POST /api/tasks/:id/feedback
// @access  Private
export const AddTaskFeedback = asyncHandler(async (req, res) => {
  const { feedback } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (feedback) task.feedback = feedback;
  task.status = "in_progress";

  await task.save();

  res.status(200).json({
    message: "Task updated successfully",
    task,
  });
});

// @desc    Accept or reject a task
// @route   PATCH /api/tasks/:id/state
// @access  Private
export const updateTaskState = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (action === "accept") task.status = "completed";
  else if (action === "reject") task.status = "pending";
  else return res.status(400).json({ message: "Invalid action" });

  await task.save();

  await Log.create({
    user: req.user.id,
    action: "State-Task",
    task: task._id,
    description: `Task "${action}" `,
    ipAddress: req.ip,
    statusCode: 201,
  });

  res.status(200).json({
    message: `Task ${action} successfully`,
    task,
  });
});

// @desc    Update field in task
// @route   PUT /api/tasks/:id
// @access  Private (Admin or Assigned User)
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, feedback, status, action } = req.body;
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  let attachmentData = task.attachment;
  if (req.file) {
    if (task.attachment?.publicId) {
      await cloudinaryRemoveFile(task.attachment.publicId);
    }

    const uploaded = await cloudinaryUploadFile(req.file.buffer);
    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Attachment upload failed" });
    }

    attachmentData = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }
  const updatedTask = await Task.findByIdAndUpdate(
    id,
    {
      $set: {
        title: title || task.title,
        description: description || task.description,
        feedback: feedback || task.feedback,
        status: status || task.status,
        action: action || task.action,
        attachment: attachmentData,
      },
    },
    { new: true }, // ترجع النسخة المحدثة
  );
  await Log.create({
    user: req.user.id,
    action: "update-task",
    task: task._id,
    description: `Task "${title}"`,
    ipAddress: req.ip,
    statusCode: 200,
  });

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task: updatedTask,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
export const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.attachment?.publicId) {
    await cloudinaryRemoveFile(task.attachment.publicId);
  }

  await Log.create({
    user: req.user.id,
    action: "delete-task",
    task: task._id,
    description: `Task "${title}"`,
    ipAddress: req.ip,
    statusCode: 200,
  });
  await task.remove();
  res.status(200).json({
    message: "Task deleted successfully",
  });
});
