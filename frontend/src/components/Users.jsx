import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
    
                if (!token) {
                    console.error("No token found");
                    return;
                }
    
                // Fetch the logged-in user details
                const userResponse = await axios.get("http://localhost:3000/api/v1/user/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                const currentUserId = userResponse.data._id;
                setCurrentUser(currentUserId);
    
                // Fetch all users with filtering
                const usersResponse = await axios.get(`http://localhost:3000/api/v1/user/bulk?filter=` + filter, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                console.log("API Response:", usersResponse.data); // Debugging purpose
    
                if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
                    const firstUser = usersResponse.data.users[0]; // Accessing the first user
                    console.log("First User:", firstUser); // Check if firstUser is defined
    
                    // Filter out the current user
                    const filteredUsers = usersResponse.data.users.filter(user => user._id !== currentUserId);
                    console.log("Filtered Users:", filteredUsers); // Debugging purpose
                    setUsers(filteredUsers);
                } else {
                    console.error("Unexpected API response structure", usersResponse.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
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
    
    return (
        <div className="flex justify-between">
            <div className="flex">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {user.firstName[0]}
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
