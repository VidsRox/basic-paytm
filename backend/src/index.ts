import express, { Request, Response, NextFunction } from "express";
import Cors from "cors";
import { connectToDatabase } from "./db"
import session from "express-session";
import userRouter from "./routes/user"
import accountRouter from "./routes/accounts";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "https://basic-paytm-frontend-six.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).json({});
  } else {
    next();
  }
});

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
    cookie: { secure: false }, // Set `secure: true` if using HTTPS
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);

// Instead of starting a server with app.listen(), export the app
export default app;
