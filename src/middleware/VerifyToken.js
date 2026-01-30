
import JWT from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const VerifyToken = asyncHandler(async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (authToken && authToken.startsWith("Bearer ")) {
    const token = authToken.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Token is missing after Bearer");
    }

    const decodedPayload = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decodedPayload;
    next();
  } else {
    res.status(401);
    throw new Error("You are not logged in to access this token");
  }
});

export const VerifyTokenAdmin = asyncHandler(async (req, res, next) => {
  await VerifyToken(req, res, async () => {
    if (req.user && req.user.role === "Admin") {
      next();
    } else {
      res.status(403);
      throw new Error("Not allowed, only Admin");
    }
  });
});




