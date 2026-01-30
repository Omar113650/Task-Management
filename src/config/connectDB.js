import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

let isConnected = false;
const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed:", err);
    process.exit(1);
  }
};

app.use((req, res, next) => {
  if (!isConnected) {
    connectDB();
  }
  next();
});

export default connectDB;
