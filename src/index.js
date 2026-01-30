import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { notfound, errorHandler } from "./middleware/error.js";
import mongoSanitize from "express-mongo-sanitize";
import statusMonitor from "express-status-monitor";
import { globalSanitizer } from "./middleware/sanitization.js";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
dotenv.config({ path: ".env" });
connectDB();

const app = express();

app.use(helmet());
app.use(hpp());
app.use(
  cors({
    origin: [
      // "http://localhost:5173",
      // all-user
      "*",
    ],

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(morgan());

app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

app.use(statusMonitor());

app.use(express.json());
app.use(globalSanitizer);

app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

app.use(statusMonitor());

import authRoutes from "./routes/AuthRoute.js";
import logsRoutes from "./routes/LogsRoute.js";
import taskRoutes from "./routes/TaskRoute.js";
import dashboardRoutes from "./routes/DashboardRoute.js";

app.get("/src/routes", (req, res) => res.send("Hello in vercel"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/logs", logsRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(notfound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
