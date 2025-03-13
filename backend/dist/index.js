"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const user_1 = __importDefault(require("./routes/user"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const db_1 = require("./db");
const app = (0, express_1.default)();
// CORS Configuration
app.use((0, cors_1.default)({
    origin: "https://basic-paytm-frontend-six.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json());
(0, db_1.connectToDatabase)();
app.use((0, express_session_1.default)({
    secret: "vidyunsecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Use true for HTTPS on Vercel
}));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/account", accounts_1.default);
exports.default = app;
