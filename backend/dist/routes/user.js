"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Zod schema for signup
const signupSchema = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string(),
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string()
});
// Signup route
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success, error } = signupSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Validation failed",
            error: error.errors
        });
        return;
    }
    const existingUser = yield db_1.User.findOne({ username: req.body.username });
    if (existingUser) {
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
    const dbUser = yield db_1.User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    yield db_1.Account.create({
        userId: dbUser._id,
        balance: 1 + Math.random() * 10000
    });
    const token = jsonwebtoken_1.default.sign({ userId: dbUser._id }, config_1.JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    });
}));
// Zod schema for signin
const signinBody = zod_1.default.object({
    username: zod_1.default.string().email(),
    password: zod_1.default.string()
});
// Signin route
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield db_1.User.findOne({ username });
        if (!user) {
            res.status(400).json({ message: "User doesn't exist" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid username or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.JWT_SECRET);
        res.json({ token });
    }
    catch (error) {
        console.error("Error handling /signin request:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
// Zod schema for update
const updateBody = zod_1.default.object({
    password: zod_1.default.string().optional(),
    firstName: zod_1.default.string().optional(),
    lastName: zod_1.default.string().optional()
});
// Update route
router.put("/update", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success, error } = updateBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({ message: "Error while updating information", error: error.errors });
        return;
    }
    try {
        const updatedUser = yield db_1.User.updateOne({ _id: req.userId }, req.body);
        res.json({ message: "Updated successfully", updatedUser });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}));
// Bulk route
router.get("/bulk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter || "";
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const currentUserId = decoded.userId;
        const users = yield db_1.User.find({
            _id: { $ne: currentUserId },
            $or: [
                { firstName: { $regex: filter, $options: "i" } },
                { lastName: { $regex: filter, $options: "i" } }
            ]
        });
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
// Me route
router.get("/me", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.User.findById(req.userId);
        if (user) {
            res.json({
                firstName: user.firstName,
                lastName: user.lastName
            });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
// Verify token route
router.get("/verifyToken", middleware_1.authMiddleware, (req, res) => {
    res.status(200).json({ message: "Valid token" });
});
exports.default = router;
