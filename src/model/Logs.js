import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    statusCode: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

export const Log = mongoose.model("Log", LogSchema);


