import { useEffect, useState } from "react";
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
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
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
                // Handle error (e.g., redirect to login page if unauthorized)
            }
        };

        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                // Handle error (e.g., redirect to login page if unauthorized)
            }
        };

        fetchUserData();
        fetchBalance();
    }, []);

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
