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
exports.connectToDatabase = exports.Transaction = exports.Account = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uri = "mongodb+srv://vidyun:vidyun180903@cluster0.4klaovj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(uri);
            console.log("MongoDB connected....");
        }
        catch (err) {
            console.error("Connection error", err);
            process.exit(1);
        }
    });
}
exports.connectToDatabase = connectToDatabase;
const transactionSchema = new mongoose_1.default.Schema({
    from: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 100,
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
});
const accountSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});
const Account = mongoose_1.default.model("Account", accountSchema);
exports.Account = Account;
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
const Transaction = mongoose_1.default.model("Transaction", transactionSchema);
exports.Transaction = Transaction;
