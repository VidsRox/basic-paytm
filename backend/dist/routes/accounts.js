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
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const mongoose_1 = __importDefault(require("mongoose"));
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
// GET /balance - Fetch account balance for the authenticated user
router.get("/balance", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching balance for userId:", req.userId);
    const account = yield db_1.Account.findOne({
        userId: req.userId,
    });
    if (!account) {
        res.status(404).json({
            message: "Account not found",
        });
        return;
    }
    res.json({
        balance: account.balance,
    });
}));
router.post("/transfer", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    const { amount, to } = req.body;
    try {
        const account = yield db_1.Account.findOne({ userId: req.userId }).session(session);
        if (!account || account.balance < amount) {
            yield session.abortTransaction();
            res.status(400).json({ message: "Insufficient Balance" });
            return;
        }
        const toAccount = yield db_1.Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            yield session.abortTransaction();
            res.status(400).json({ message: "Invalid Account" });
            return;
        }
        yield db_1.Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        yield db_1.Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);
        // Fix: Convert ObjectId to string
        yield (0, transactionController_1.createTransaction)(account.userId.toString(), toAccount.userId.toString(), amount, session);
        yield session.commitTransaction();
        res.json({ message: "Transfer Successful" });
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(500).json({ message: "Transfer failed", error: error.message });
    }
    finally {
        session.endSession();
    }
}));
// POST /logout route (fixing Error 2)
router.post("/logout", (req, res) => {
    if (!req.session) {
        res.status(500).json({ message: "No session found" });
        return;
    }
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            res.status(500).json({ message: "Failed to log out" });
            return;
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});
// GET /history - Fetch transaction history for the authenticated user
router.get("/history", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("User ID from middleware:", req.userId);
        const userId = new mongoose_1.default.Types.ObjectId(req.userId);
        const transactions = yield db_1.Transaction.find({
            $or: [{ from: userId }, { to: userId }],
        }).sort({ date: -1 });
        if (transactions.length === 0) {
            res.status(404).json({ message: "No transactions found" });
            return;
        }
        res.json(transactions);
    }
    catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({
            message: "Failed to fetch transaction history",
            error: error.message,
        });
    }
}));
exports.default = router;
