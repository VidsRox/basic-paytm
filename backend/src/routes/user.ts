import express, { Request, Response, NextFunction } from "express";
import { User, Account } from "../db";
import jwt from "jsonwebtoken";
import z from "zod";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config";
import { authMiddleware } from "../middleware";

const router = express.Router();

// Zod schema for signup
const signupSchema = z.object({
    username: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string()
});

// Signup route
router.post("/signup", async (req: Request, res: Response) => {
    const { success, error } = signupSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Validation failed",
            error: error.errors
        });
        return;
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const dbUser = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    await Account.create({
        userId: dbUser._id,
        balance: 1 + Math.random() * 10000
    });

    const token = jwt.sign({ userId: dbUser._id }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    });
});

// Zod schema for signin
const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
});

// Signin route
router.post("/signin", async (req: Request, res: Response) => {
    const { success, error } = signinBody.safeParse(req.body);
    if (!success) {
        res.status(400).json({
            message: "Invalid input",
            error: error.errors
        });
        return;
    }

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            res.status(400).json({ message: "User doesn't exist" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid username or password" });
            return;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (error: any) {
        console.error("Error handling /signin request:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Zod schema for update
const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
});

// Update route
router.put("/update", authMiddleware, async (req: Request, res: Response) => {
    const { success, error } = updateBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({ message: "Error while updating information", error: error.errors });
        return;
    }

    try {
        const updatedUser = await User.updateOne({ _id: (req as any).userId }, req.body);
        res.json({ message: "Updated successfully", updatedUser });
    } catch (err: any) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// Interface for User document (adjust based on your actual User model)
interface IUser {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
}

// Bulk route
router.get("/bulk", async (req: Request, res: Response) => {
    try {
        const filter = (req.query.filter as string) || "";
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const currentUserId = decoded.userId;

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { firstName: { $regex: filter, $options: "i" } },
                { lastName: { $regex: filter, $options: "i" } }
            ]
        }) as IUser[];

        if (users.length === 0) {
            res.status(404).json({ message: "No users found" });
            return;
        }

        res.json({
            users: users.map((user) => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Me route
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).userId);
        if (user) {
            res.json({
                firstName: user.firstName,
                lastName: user.lastName
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Verify token route
router.get("/verifyToken", authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ message: "Valid token" });
});

export default router;