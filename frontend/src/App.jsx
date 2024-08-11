import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {AuthProvider} from './authentication/AuthContext'
import {IntroPage} from './pages/IntroPage'
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import {Dashboard} from './pages/Dashboard'
import { SendMoney } from './pages/SendMoney';
import ProtectedRoute from './authentication/ProtectedRoute'

const App = () => (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route 
                    path="/dashboard" 
                    element={<ProtectedRoute element={Dashboard} />} 
                />
                <Route path="/send" element={<SendMoney />} />
            </Routes>
        </Router>
    </AuthProvider>
);

export default App;
