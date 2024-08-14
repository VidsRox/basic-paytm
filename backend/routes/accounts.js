const express = require("express");
const {authMiddleware } = require("../middleware");
const { Account, Transaction } = require("../db");
const { default: mongoose } = require("mongoose");

const  {createTransaction} = require('../controllers/transactionController')

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    console.log('Fetching balance for userId:', req.userId);  // Add this line for debugging
    const account = await Account.findOne({
        userId: req.userId
    });

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }

    res.json({
        balance: account.balance
    });
});

router.post("/transfer", authMiddleware, async (req, res) => {
    // Start a session for the transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction(); // Begin the transaction

    const { amount, to } = req.body; // Destructure 'amount' and 'to' from the request body

    // Validate the 'amount' input
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    // Validate the 'to' input (recipient account ID)
    if (!to || typeof to !== "string") {
        return res.status(400).json({ message: "Invalid recipient account ID" });
    }

    try {
        // Fetch the account of the logged-in user using the userId from the token (set by authMiddleware)
        const account = await Account.findOne({ userId: req.userId }).session(session);

        // Check if the account exists and if the balance is sufficient for the transfer
        if (!account || account.balance < amount) {
            await session.abortTransaction(); // Abort the transaction if balance is insufficient
            return res.status(400).json({
                message: "Insufficient Balance" // Inform the user about the insufficient balance
            });
        }

        // Fetch the recipient's account using the provided 'to' userId
        const toAccount = await Account.findOne({ userId: to }).session(session);
        console.log("Recipient Account Query:", { to, toAccount });

        // Check if the recipient's account exists
        if (!toAccount) {
            await session.abortTransaction(); // Abort the transaction if the recipient's account is invalid
            return res.status(400).json({
                message: "Invalid Account" // Inform the user about the invalid recipient account
            });
        }

        // Deduct the transfer amount from the sender's account
        await Account.updateOne(
            { userId: req.userId },
            { $inc: { balance: -amount } } // Decrement balance by the transfer amount
        ).session(session);

        // Add the transfer amount to the recipient's account
        await Account.updateOne(
            { userId: to },
            { $inc: { balance: amount } } // Increment balance by the transfer amount
        ).session(session);

        // Create a transaction record to log the details of this transfer
        const transaction = new Transaction({
            from: account.userId, // The sender's user ID
            to: toAccount.userId, // The recipient's user ID
            amount, // The transfer amount
            date: new Date() // The date and time of the transaction
        });

        await transaction.save({ session }); // Save the transaction record within the session

        // Commit the transaction to apply all changes atomically
        await session.commitTransaction();

        // Send a success response to the client
        res.json({ message: "Transfer Successful" });
    } catch (error) {
        // If an error occurs, abort the transaction and roll back changes
        await session.abortTransaction();
        res.status(500).json({
            message: "Transfer failed", // Inform the user about the failure
            error: error.message // Provide error details to assist with debugging
        });
    } finally {
        // Ensure the session is ended whether the transaction succeeds or fails
        session.endSession();
    }
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(500).json({ message: 'No session found' });
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        // Log the user ID to verify it's correctly set
        console.log("User ID from middleware:", req.userId);

        // Convert req.userId to ObjectId correctly
        const userId = new mongoose.Types.ObjectId(req.userId);

        // Query to find transactions where the user is either the sender or the recipient
        const transactions = await Transaction.find({
            $or: [
                { from: userId }, // Transactions where the user is the sender
                { to: userId }    // Transactions where the user is the recipient
            ]
        }).sort({ date: -1 }); // Sort by date, most recent first

        // If no transactions are found, return a 404 status with a message
        if (transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found" });
        }

        // Return the found transactions
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transaction history:", error);

        // Return a 500 status with an error message if something goes wrong
        res.status(500).json({
            message: "Failed to fetch transaction history",
            error: error.message
        });
    }
});



module.exports = router;