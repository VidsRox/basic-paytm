import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { Users } from "../components/Users";
import { Balance } from "../components/Balance";
import { WelcomeMessage } from "../components/WelcomeMessage";
import axios from "axios";
import { DropdownMenu } from "../components/Dropdown";
import { useAuth } from "../authentication/AuthContext";

export const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [initials, setInitials] = useState("");
    const [firstName, setFirstName] = useState("");
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/signin"); // Redirect to sign-in if not authenticated
            return;
        }

        const fetchUserData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/signin");
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { firstName, lastName } = response.data;

                setFirstName(firstName);
                const userInitials = `${firstName[0]}${lastName[0]}`;
                setInitials(userInitials);
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate("/signin");
            }
        };

        const fetchBalance = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/signin");
                return;
            }

            try {
                const response = await axios.get("https://basic-paytm.vercel.app/api/v1/account/balance", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                navigate("/signin");
            }
        };

        fetchUserData();
        fetchBalance();
    }, [isAuthenticated, navigate]);

    if (loading) {
        return <div>Loading...</div>; // Show loading state while checking auth
    }

    return (
        <div>
            <Appbar initials={initials} />
            <div className="flex justify-end m-4">
                <DropdownMenu />
            </div>
            <div className="m-8">
                <WelcomeMessage firstName={firstName} />
                <Balance value={balance.toLocaleString()} />
                <Users />
                <button
                    onClick={() => navigate("/history")}
                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded"
                >
                    View Transaction History
                </button>
            </div>
        </div>
    );
};
