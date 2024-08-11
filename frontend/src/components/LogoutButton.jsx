import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3000/api/v1/account/logout');
            localStorage.removeItem('token');
            navigate('/signin');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
        >
            Logout
        </button>
    );
};
