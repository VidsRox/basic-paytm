import express from "express";
import Cors from "cors";
import session from "express-session";
import userRouter from "./routes/user";
import accountRouter from "./routes/accounts";
import { connectToDatabase } from "./db";

const app = express();

// CORS Configuration
app.use(
  Cors({
    origin: "https://basic-paytm-frontend-six.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
connectToDatabase();

app.use(
  session({
    secret: "vidyunsecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Use true for HTTPS on Vercel
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);

export default app;