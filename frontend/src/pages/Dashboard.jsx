import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { Appbar } from "../components/Appbar";
import { Users } from "../components/Users";
import { Balance } from "../components/Balance";
import { WelcomeMessage } from "../components/WelcomeMessage";
import axios from "axios";
import { LogoutButton } from "../components/LogoutButton";

export const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [initials, setInitials] = useState("");
    const [firstName, setFirstName] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/signin"); // Redirect to sign-in page if no token is found
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const { firstName, lastName } = response.data;

                // Store first name
                setFirstName(firstName);

                // Generate initials
                const userInitials = `${firstName[0]}${lastName[0]}`;
                setInitials(userInitials);
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate("/signin"); // Redirect to sign-in page if there is an error
            }
        };

        const fetchBalance = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/signin"); // Redirect to sign-in page if no token is found
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                navigate("/signin"); // Redirect to sign-in page if there is an error
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchUserData();
        fetchBalance();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>; // Render loading state while fetching data
    }

    return (
        <div>
            <Appbar initials={initials} />
            <div className="flex justify-end m-4">
                <LogoutButton />
            </div>
            <div className="m-8">
                <WelcomeMessage firstName={firstName} />
                <Balance value={balance.toLocaleString()} />
                <Users />
            </div>
        </div>
    );
};
