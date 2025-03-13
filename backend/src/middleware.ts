import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

// Define the middleware with RequestHandler-compatible signature
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(403).json({ message: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        if (decoded.userId) {
            // Safely add userId to req using type assertion
            (req as any).userId = decoded.userId;
            next();
        } else {
            res.status(403).json({ message: "Invalid token: userId missing" });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("JWT Verification Error:", error.message);
        }
        res.status(403).json({ message: "Failed to authenticate token" });
    }
};