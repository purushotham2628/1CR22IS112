const express = require("express");
const dotenv = require("dotenv");
const requestLogger = require("./middleware/requestLogger");
const shortenerRoutes = require("./routes/shortener");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// log every request lifecycle using the reusable package
app.use(requestLogger);

// health
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// shortener routes
app.use("/", shortenerRoutes);

app.listen(PORT,()=>{
    console.log(`Your server is running at the port http://localhost:${PORT}`)
});

