import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem("token"); // Ensure token is stored in localStorage after login
                const response = await axios.get("https://basic-paytm-server.vercel.app/api/v1/account/history", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach the token for authentication
                    },
                });
                setTransactions(response.data); // Set transactions data to state
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            }
        };

        fetchTransactions(); // Fetch transactions on component mount
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Transaction History</h1>

            {transactions.length > 0 ? (
                <ul className="w-full max-w-3xl bg-white shadow-md rounded-lg p-4">
                    {transactions.map((transaction) => (
                        <li
                            key={transaction._id}
                            className="border-b last:border-none p-3 flex justify-between"
                        >
                            <div className="text-gray-600">{new Date(transaction.date).toLocaleDateString()}</div>
                            <div className="text-gray-800 font-medium">
                                {transaction.amount} USD
                            </div>
                            <div className="text-gray-500">
                                {transaction.from === localStorage.getItem("userId") // Assuming you store the user's ID in localStorage after login
                                    ? `Sent to ${transaction.to}`
                                    : `Received from ${transaction.from}`}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No transactions found.</p>
            )}

            <button
                onClick={() => navigate("/dashboard")}
                className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default TransactionHistory;
