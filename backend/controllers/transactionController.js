const {Transaction} = require('../db')


const createTransaction = async (from, to, amount) => {
    try {
        const transaction = new Transaction({
            from,
            to,
            amount,
            date: new Date() // Set current date/time explicitly
        });

        await transaction.save();
        return transaction;
    } catch (error) {
        console.error('Error creating transaction:', error.message);
        throw new Error('Failed to create transaction');
    }
};

module.exports = { createTransaction };