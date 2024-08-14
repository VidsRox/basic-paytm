const express = require("express");
const Cors = require('cors');
const rootRouter = require("./routes/index");
const { connectToDatabase } = require("./db");
const session = require('express-session');

const app = express();

app.use(Cors({
  origin: "https://basic-paytm-frontend-six.vercel.app",
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

app.use("/api/v1", rootRouter);

