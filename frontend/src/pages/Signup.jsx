import { useState } from "react";
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

    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
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
                        onClick={async () => {
                            const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
                                username,
                                firstName,
                                lastName,
                                password
                            });
                            localStorage.setItem("token", response.data.token);
                            //when user has logged out-
                            //localStorage.removeItem("token");
                        }}
                        label={"Sign up"}
                    />
                </div>

                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    );
};