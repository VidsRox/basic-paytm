import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

export const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout(); // Call logout from AuthContext
        navigate('/signin'); // Redirect to sign-in page
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
