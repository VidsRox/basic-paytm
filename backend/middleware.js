const { JWT_SECRET } = require("./config");
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        console.log('JWT_SECRET:', JWT_SECRET); // Debugging statement
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);
        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({ message: "Invalid token: userId missing" });
        }
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(403).json({ message: "Failed to authenticate token" });
    }
};

module.exports = { authMiddleware };
