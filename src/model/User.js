import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 7,
    },

    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
