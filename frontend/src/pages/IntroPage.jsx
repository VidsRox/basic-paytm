import {useNavigate} from 'react-router-dom'

export const IntroPage = () => {
    const navigate = useNavigate();
    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100'>
            <div className='text-center mb-8'>
                <h1 className='text-4xl font-bold mb-4'>Payments App</h1>
                    <p className='text-lg mb-6'>Your gateway to seamless transactions and user management</p>
            </div>
            <div className='flex flex-col space-y-4'>
                <button
                onClick={()=> navigate("/signup")}
            className='px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300'
                >
                    Sign Up
                </button>
                <button 
                    onClick={() => navigate("/signin")}
                    className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                >
                    Sign In
                </button>
            </div>
        </div>
    )
}
