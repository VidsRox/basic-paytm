// src/components/DropdownMenu.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../authentication/AuthContext';

export const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout(); // Call logout from AuthContext
        navigate('/signin'); // Redirect to sign-in page
    };

    const handleUpdateDetails = () => {
        navigate('/update');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
                Menu
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
                    <button
                        onClick={handleUpdateDetails}
                        className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                        Update Details
                    </button>
                    <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-red-500 hover:bg-red-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
