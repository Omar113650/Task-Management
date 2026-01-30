

import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    action: {
      type: String,
      enum: ["accept", "reject"],
    },

    attachment: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },

    feedback: {
      type: String,
      default: null, // Feedback من الـ Admin
      maxlength: 1000,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", TaskSchema);






