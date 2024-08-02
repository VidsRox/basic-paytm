export function InputBox({ label, placeholder, onChange, type = "text", showPasswordToggle, onTogglePassword, showPassword }) {
    return (
        <div className="mb-4">
            <div className="text-sm font-medium text-left py-2">
                {label}
            </div>
            <div className="relative">
                <input
                    onChange={onChange}
                    placeholder={placeholder}
                    type={type}
                    className="w-full px-2 py-1 border rounded border-slate-200 pr-12"
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                )}
            </div>
        </div>
    );
}
