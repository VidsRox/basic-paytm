const mongoose = require('mongoose');

const uri = "mongodb+srv://vidyun:vidyun180903@cluster0.4klaovj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

async function connectToDatabase() {
    try {
        await mongoose.connect(uri)
        console.log("MongoDB connected....")
    } catch(err) {
            console.error("Connection error", err);
        }
}

// Schema for storing transaction data
const transactionSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }, // Automatically sets the date and time to the current time
});

// Schema for storing user data
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 100
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
});

// Schema for storing account balance data
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

// Schema models for interacting with the database
const Account = mongoose.model('Account', accountSchema); 
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    User, connectToDatabase, Account, Transaction
};