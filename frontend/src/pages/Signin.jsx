import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom"; // Import Navigate for redirect
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext"; // Import useAuth

export const Signin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // use isAuthenticated from AuthContext

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard"); // Redirect to dashboard if already authenticated
        }
    }, [isAuthenticated, navigate]);

    const handleSignin = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
                username,
                password
            });

            localStorage.setItem("token", response.data.token);
            // localStorage.setItem("firstName", response.data.firstName);
            navigate("/dashboard"); // Redirect to dashboard on successful login
        } catch (error) {
            console.error("Error during sign in:", error);
            // Handle error (e.g., show a message to the user)
        }
    };

    // If user is already authenticated, redirect them to the dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
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
                    <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
                </div>
            </div>
        </div>
    );
};
