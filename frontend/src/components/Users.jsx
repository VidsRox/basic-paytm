import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found");
                    // Redirect to login or show an error
                    return;
                }

                // Fetch the logged-in user details
                const userResponse = await axios.get("https://basic-paytm-server.vercel.app/api/v1/user/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const currentUserId = userResponse.data._id;
                setCurrentUser(currentUserId);

                // Fetch all users with filtering
                const usersResponse = await axios.get(`https://basic-paytm-server.vercel.app/api/v1/user/bulk?filter=` + filter, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
                    // Filter out the current user
                    const filteredUsers = usersResponse.data.users.filter(user => user._id !== currentUserId);
                    setUsers(filteredUsers);
                } else {
                    console.error("Unexpected API response structure", usersResponse.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users. Please try again.");
            }
        };

        fetchUsers();
    }, [filter]);

    return (
        <>
            <div className="font-bold mt-6 text-lg">Users</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search users...."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                    value={filter} // Controlled input
                />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div>
                {users.length > 0 ? (
                    users.map(user => <User key={user._id} user={user} />)
                ) : (
                    <div>No users found</div>
                )}
            </div>
        </>
    );
}

function User({ user }) {
    const navigate = useNavigate();
    const initial = user.firstName ? user.firstName[0] : "";

    return (
        <div className="flex justify-between">
            <div className="flex">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {initial}
                    </div>
                </div>
                <div className="flex flex-col justify-center h-full">
                    <div>
                        {user.firstName} {user.lastName}
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center h-full">
                <Button 
                    onClick={() => navigate("/send?id=" + user._id + "&name=" + user.firstName)}
                    label={"Send Money"}
                />
            </div>
        </div>
    );
}
