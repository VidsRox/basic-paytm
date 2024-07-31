const express = require("express");
var Cors = require('cors');
const rootRouter = require("./routes/index");
const {connectToDatabase} = require("./db")


const app = express()

app.use(Cors())
app.use(express.json())

connectToDatabase();

app.use("/api/v1", rootRouter)

const port = 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});