import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Users } from "../components/Users";
import { Balance } from "../components/Balance";
import axios from "axios";

export const Dashboard = () => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
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

        fetchBalance();
    }, []);

    return (
        <div>
            <Appbar />
            <div className="m-8">
                <Balance value={balance.toLocaleString()} />
                <Users />
            </div>
        </div>
    );
};
