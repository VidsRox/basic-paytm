import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware";
import { Account, Transaction } from "../db";
import mongoose from "mongoose";
import { createTransaction } from "../controllers/transactionController";

// Extend the Express Request interface to include userId added by authMiddleware
declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}

const router = express.Router();

// GET /balance - Fetch account balance for the authenticated user
router.get("/balance", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  console.log("Fetching balance for userId:", req.userId);
  const account = await Account.findOne({
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
});

router.post("/transfer", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to } = req.body as { amount: number; to: string };

  try {
    const account = await Account.findOne({ userId: req.userId }).session(session);
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      res.status(400).json({ message: "Insufficient Balance" });
      return;
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      res.status(400).json({ message: "Invalid Account" });
      return;
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Fix: Convert ObjectId to string
    await createTransaction(account.userId.toString(), toAccount.userId.toString(), amount, session);

    await session.commitTransaction();
    res.json({ message: "Transfer Successful" });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: "Transfer failed", error: error.message });
  } finally {
    session.endSession();
  }
});

// POST /logout route (fixing Error 2)
router.post("/logout", (req: Request, res: Response): void => {
  if (!req.session) {
    res.status(500).json({ message: "No session found" });
    return;
  }

  req.session.destroy((err: Error) => {
    if (err) {
      console.error("Session destroy error:", err);
      res.status(500).json({ message: "Failed to log out" });
      return;
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// GET /history - Fetch transaction history for the authenticated user
router.get("/history", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("User ID from middleware:", req.userId);

    const userId = new mongoose.Types.ObjectId(req.userId);

    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }],
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      res.status(404).json({ message: "No transactions found" });
      return;
    }

    res.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      message: "Failed to fetch transaction history",
      error: error.message,
    });
  }
});

export default router;