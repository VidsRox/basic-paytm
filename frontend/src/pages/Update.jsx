import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Update = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }

        try {
            await axios.put("https://basic-paytm-server.vercel.app/api/v1/user/update", { firstName, lastName }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("Credentials updated");

            // Redirect to the dashboard after 2 seconds
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error updating details:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Your Details</h1>
                {message && (
                    <div className="mb-4 p-2 text-center text-white rounded-md bg-green-500">
                        {message}
                    </div>
                )}
                <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
};
