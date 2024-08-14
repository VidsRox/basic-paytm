import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import Heading from "../components/Heading";
import SubHeading from "../components/SubHeading";
import InputBox from "../components/InputBox";
import Button from "../components/Button";
import BottomWarning from "../components/BottomWarning";

export const Signin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null); // State for error messages
    const navigate = useNavigate();
    const { isAuthenticated, login, loading } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard"); // Redirect to dashboard if already authenticated
        }
    }, [isAuthenticated, navigate]);

    const handleSignin = async () => {
        try {
            const response = await axios.post("https://basic-paytm.vercel.app/api/v1/user/signin", {
                username,
                password
            });

            login(response.data.token); // Use login from AuthContext
            navigate("/dashboard"); // Redirect to dashboard on successful login
        } catch (error) {
            console.error("Error during sign in:", error);
            // Set the error message to state to display it in the UI
            setError(error.response?.data.message || "An error occurred during sign in.");
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading message while checking auth
    }

    if (isAuthenticated) {
        return null; // Avoid rendering the Signin component if authenticated
    }

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            {/* Home Page Button */}
            <div className="absolute top-4 left-4">
                <button
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                    onClick={() => navigate("/")}
                >
                    Home Page
                </button>
            </div>

            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Sign in"} />
                    <SubHeading label={"Enter credentials to access account"} />
                    <InputBox
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="vidyun@gmail.com"
                        label={"Email"}
                    />
                    <InputBox
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="123456"
                        label={"Password"}
                        type="password"
                    />
                    <div className="pt-4">
                        <Button label={"Sign in"} onClick={handleSignin} />
                    </div>
                    {/* Display the error message */}
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                    <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
                </div>
            </div>
        </div>
    );
};
