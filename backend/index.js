const express = require("express");
const Cors = require('cors');
const { connectToDatabase } = require("./db");
const session = require('express-session');
const userRouter = require("./routes/user");
const accountRouter = require('./routes/accounts');

const app = express();

// CORS Configuration
app.use(Cors({
  origin: "https://basic-paytm-frontend-six.vercel.app", // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

connectToDatabase();

app.use(session({
  secret: 'vidyunsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `secure: true` if using HTTPS
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);

// Start the server
// app.listen(3000);
