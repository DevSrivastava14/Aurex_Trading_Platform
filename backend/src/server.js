const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AUREX API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "AUREX backend is healthy"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`AUREX server running on http://localhost:${PORT}`);
});