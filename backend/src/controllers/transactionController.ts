import { Transaction } from "../db";
import { ClientSession } from "mongoose";

// Define the createTransaction function with typed parameters and optional session
const createTransaction = async (
  from: string,
  to: string,
  amount: number,
  session?: ClientSession // Optional session parameter
) => {
  try {
    const transaction = new Transaction({
      from,
      to,
      amount,
      date: new Date(),
    });

    await transaction.save({ session }); // Pass session if provided
    return transaction;
  } catch (error: any) {
    console.error("Error creating transaction:", error.message);
    throw new Error("Failed to create transaction");
  }
};

export { createTransaction }; // Use ES module export