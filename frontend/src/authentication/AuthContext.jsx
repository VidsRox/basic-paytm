import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () =>{
            const authToken = localStorage.getItem('token')
            if(authToken){
                try {
                    await axios.get('http://localhost:3000/api/v1/user/verifyToken', {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setIsAuthenticated(true)
                } catch {
                    setIsAuthenticated(false);
                }
            }
            setLoading(false)
        };

        checkAuth();
    }, [])

    const login = (authToken) => {
        localStorage.setItem('token', authToken)
        setIsAuthenticated(true);
    }

    const logout = () => {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
    };

    return(
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);