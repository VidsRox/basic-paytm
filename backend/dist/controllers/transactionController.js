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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const db_1 = require("../db");
// Define the createTransaction function with typed parameters and optional session
const createTransaction = (from, to, amount, session // Optional session parameter
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = new db_1.Transaction({
            from,
            to,
            amount,
            date: new Date(),
        });
        yield transaction.save({ session }); // Pass session if provided
        return transaction;
    }
    catch (error) {
        console.error("Error creating transaction:", error.message);
        throw new Error("Failed to create transaction");
    }
});
exports.createTransaction = createTransaction;
