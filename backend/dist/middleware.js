"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
// Define the middleware with RequestHandler-compatible signature
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(403).json({ message: "Unauthorized: No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (decoded.userId) {
            // Safely add userId to req using type assertion
            req.userId = decoded.userId;
            next();
        }
        else {
            res.status(403).json({ message: "Invalid token: userId missing" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("JWT Verification Error:", error.message);
        }
        res.status(403).json({ message: "Failed to authenticate token" });
    }
};
exports.authMiddleware = authMiddleware;
