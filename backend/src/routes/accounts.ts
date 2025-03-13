import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config"

// Define the custom AuthRequest interface
interface AuthRequest extends Request {
  userId?: string; // Optional, set by middleware
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId; // Assign userId to req
    next();
  } catch (error) {
    res.status(403).json({ message: "Failed to authenticate token" });
  }
};

export default authMiddleware;