export const WelcomeMessage = ({ firstName }) => {
    return (
        <div className="flex justify-start items-center mb-4">
            <h2 className="text-xl font-bold">Welcome, {firstName}!</h2>
        </div>
    );
};
