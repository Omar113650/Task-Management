





import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../model/User.js";
import { sendEmail } from "../utils/emailServices.js";
import { Log } from "../model/Logs.js";
const generateTokens = (user) => {
  const AccessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return { AccessToken, refreshToken };
};
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("RefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
// @desc    register a new user
// @route   post /api/v1/auth/register
// @access  Public
export const Register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(403).json({ message: "email already is use" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role,
  });

  const { AccessToken, refreshToken } = generateTokens(user);
  setRefreshCookie(res, refreshToken);

  await Log.create({
    user: user._id,
    action: "Register",
    description: `register "${name}" `,
    ipAddress: req.ip,
    statusCode: 201,
  });
  res.status(201).json({
    message: "registration successful",
    user: {
      id: user._id,
      Name: user.name,
      Email: user.email,
      role: user.role,
    },
    AccessToken,
    refreshToken,
  });
});

// @desc    Login user
// @route   post /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid  email or password" });
  }
  await Log.create({
    user: user._id,
    action: "Login",
    description: `User login: ${email}`,
    ipAddress: req.ip,
    statusCode: 200,
  });

  const loginTime = new Date();
  const formattedTime = loginTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  await sendEmail({
    to: user.email,
    subject: "Login Successful",
    text: `Hi ${user.name}, you logged in successfully to Task Management on ${formattedTime}`,
    html: `
    <div style="background:#f4f6f8; padding:30px; font-family: Arial, sans-serif; text-align:center;">
      <div style="
        max-width:500px;
        margin:auto;
        background:#ffffff;
        border-radius:10px;
        padding:25px;
        box-shadow:0 4px 12px rgba(0,0,0,0.1);
      ">
        <h2 style="color:#2c3e50; margin-bottom:10px;">Login Successful</h2>
        <p style="font-size:16px; color:#555; line-height:1.6;">
          Hi <strong>${user.name}</strong>, you logged in successfully to <strong>Task Management</strong>.
        </p>
        <p style="font-size:14px; color:#555; line-height:1.6; margin-top:15px;">
           <strong>Login Time:</strong> ${formattedTime}
        </p>
        <p style="font-size:14px; color:#888; margin-top:20px;">
          If this wasn't you, please secure your account immediately.
        </p>
      </div>
    </div>
  `,
  });
  const { AccessToken, refreshToken } = generateTokens(user);
  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    message: "login successful",
    user: {
      id: user._id,
      Name: user.name,
      Email: user.email,
      role: user.role,
    },
    AccessToken,
    refreshToken,
  });
});
// @desc    logout user
// @route   post /api/v1/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("AccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("RefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "logged out successfully" });
});
// @desc    update Profile
// @route   post /api/v1/auth/update
// @access  Public
export const UpdateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser._id.toString() !== id) {
    return res.status(403).json({ message: "email  already is use" });
  }
  user.name = name;
  user.email = email;

  await user.save();

  res.status(200).json({
    message: "profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
// @desc    refresh access token
// @route   post /api/v1/auth/refresh
// @access  Public
export const RefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.RefreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { AccessToken } = generateTokens(user);

  res.cookie("AccessToken", AccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15m
  });

  return res.status(200).json({
    message: "Access token refreshed successfully",
    AccessToken,
  });
});

// @desc    forgot password and send OTP to verify email
// @route   post /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "email does not exist",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 5);

  user.otp = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

  await user.save();

  await Log.create({
    user: user._id,
    action: "forget_password",
    description: `forget-password "${email}" `,
    ipAddress: req.ip,
    statusCode: 201,
  });
  await sendEmail({
    to: email,
    subject: "OTP",
    text: `Hi, your OTP for resetting the password is: ${otp}. It expires in 1 minute`,
    html: `
    <div style="background:#f4f6f8; padding:20px; font-family: Arial, sans-serif; text-align:center;">
      <div style="max-width:400px; margin:auto; background:#ffffff; border-radius:10px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <h3 style="color:#2c3e50; margin-bottom:15px;">Reset Password OTP</h3>
        <p style="font-size:16px; color:#555;">
          Your OTP is: <strong>${otp}</strong>
        </p>
        <p style="font-size:14px; color:#888; margin-top:10px;">
          It will expire in 1 minute
        </p>
        <p style="font-size:12px; color:#aaa; margin-top:15px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `,
  });

  res.status(200).json({
    message: "otp sent to your email",
  });
});

// @desc    verify OTP
// @route   post /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      message: "user Id and otp are required",
    });
  }

  const user = await User.findById(userId).select(
    "_id otp otpExpiresAt isAccountVerified",
  );

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  if (user.isAccountVerified) {
    return res.status(200).json({ message: "account already verified" });
  }

  if (!user.otp || !user.otpExpiresAt) {
    return res.status(400).json({
      message: "no otp found, please request a new one",
    });
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({
      message: "otp has expired, please resend",
    });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  user.isAccountVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    message: "OTP verified successfully",
  });
});

// @desc    resend otp
// @route   post /api/auth/resend-otp
// @access  Public
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const user = await User.findOne({ email }).select(
    "_id otp otpExpiresAt isAccountVerified",
  );

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // rate limit : 1m
  if (
    user.otpExpiresAt &&
    user.otpExpiresAt.getTime() > Date.now() - 60 * 1000
  ) {
    return res.status(400).json({
      message: "Please wait 1 minute before requesting a new OTP",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 5);

  user.otp = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: email,
    subject: "OTP",
    text: `Hi, your New OTP for resetting the password is: ${otp}. It expires in 1 minute`,
    html: `
    <div style="background:#f4f6f8; padding:20px; font-family: Arial, sans-serif; text-align:center;">
      <div style="max-width:400px; margin:auto; background:#ffffff; border-radius:10px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <h3 style="color:#2c3e50; margin-bottom:15px;">Reset Password OTP</h3>
        <p style="font-size:16px; color:#555;">
          Your OTP is: <strong>${otp}</strong>
        </p>
        <p style="font-size:14px; color:#888; margin-top:10px;">
          It will expire in 1 minute
        </p>
        <p style="font-size:12px; color:#aaa; margin-top:15px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `,
  });

  res.status(200).json({
    message: "new OTP has been sent to your email",
  });
});

// @desc    reset password for logged-in user
// @route   post /api/auth/reset-password
// @access  Private
export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      message: "userId and password are required",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  password = await bcrypt.hash(password, 10);
  user.password = password;
  await user.save();

  res.status(200).json({
    message: "password Changed successfully. now can Login by this password",
  });
});









