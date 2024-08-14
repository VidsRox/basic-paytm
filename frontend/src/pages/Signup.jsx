import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import axios from "axios";

export const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(""); // State for success message

    const navigate = useNavigate(); // Initialize useNavigate hook

    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleSignup = async () => {
        try {
            const response = await axios.post("https://basic-paytm.vercel.app/api/v1/user/signup", {
                username,
                firstName,
                lastName,
                password
            });
    
            // Show success message
            setSuccessMessage("User created successfully! Redirecting to sign in...");
    
            // Wait for a few seconds before redirecting
            setTimeout(() => {
                navigate("/signin");
            }, 2000); // Redirect after 2 seconds
    
        } catch (error) {
            console.error('Error during signup:', error);
            // Provide feedback to the user if there's a network error
            if (error.code === 'ERR_NETWORK') {
                alert('Network error: Please check your connection or try again later.');
            } else if (error.response && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };
    

    return (
        <div className="bg-slate-300 h-screen flex justify-center items-center">
            <div className="flex flex-col w-80 bg-white text-center rounded-lg p-4">
                <Heading label={"Sign up"} />
                <SubHeading label={"Enter your details to create an account"} />

                <InputBox
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    label={"First Name"}
                />

                <InputBox
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    label={"Last Name"}
                />

                <InputBox
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="vidyun@gmail.com"
                    label={"Email"}
                />

                <InputBox
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="abcd1234"
                    label={"Password"}
                    type={showPassword ? "text" : "password"}
                    showPasswordToggle={true}
                    onTogglePassword={handlePasswordToggle}
                    showPassword={showPassword}
                />

                <div className="pt-4">
                    <Button
                        onClick={handleSignup}
                        label={"Sign up"}
                    />
                </div>

                {successMessage && ( // Display success message if it exists
                    <div className="text-green-600 mt-2">
                        {successMessage}
                    </div>
                )}

                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    );
};
