import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from "axios";
import { useState } from 'react';

export const SendMoney = () => {
    // Getting search parameters from the URL
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    // State to manage form inputs, loading state, and messages
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // useNavigate hook to programmatically navigate to different routes
    const navigate = useNavigate();

    // Function to handle money transfer
    const handleTransfer = async () => {
        setLoading(true);  // Show loading state while the request is being processed
        setError(null);    // Clear any previous errors
        setSuccess(null);  // Clear any previous success messages

        try {
            // Send POST request to initiate the money transfer
            const response = await axios.post("http://localhost:3000/api/v1/account/transfer", {
                to: id,
                amount
            }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token") // Include JWT in the request headers
                }
            });

            // On success, set the success message
            setSuccess("Transfer successful!");
            console.log("Transfer successful:", response.data);

            // Redirect to the dashboard after a 1-second delay
            setTimeout(() => {
                navigate('/dashboard', { state: { successMessage: 'Transfer successful!' } });
            }, 1000); // 1-second delay (1000 milliseconds)
        } catch (error) {
            // If there's an error, set the error message
            setError(error.response ? error.response.data.message : error.message);
            console.error("Transfer failed:", error.response ? error.response.data : error.message);
        } finally {
            setLoading(false); // Stop showing the loading state
        }
    };

    return (
        <div className="flex justify-center h-screen bg-gray-100">
            <div className="h-full flex flex-col justify-center">
                <div
                    className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg"
                >
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h2 className="text-3xl font-bold text-center">Send Money</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                {/* Displaying the first letter of the recipient's name */}
                                <span className="text-2xl text-white">{name ? name[0].toUpperCase() : '?'}</span>
                            </div>
                            <h3 className="text-2xl font-semibold">{name}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    htmlFor="amount"
                                >
                                    Amount (in Rs)
                                </label>
                                <input
                                    onChange={(e) => {
                                        setAmount(e.target.value); // Update amount state as user types
                                    }}
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    id="amount"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <button
                                onClick={handleTransfer} // Trigger the transfer function on click
                                className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white"
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? 'Processing...' : 'Initiate Transfer'} {/* Show loading text if loading */}
                            </button>
                            {/* Display success or error message */}
                            {success && <p className="text-green-500 text-center mt-2">{success}</p>}
                            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
