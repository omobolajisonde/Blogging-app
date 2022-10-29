const express = require("express");

const authRouter = require("./routes/authRoutes");

const app = express();

const API_BASE_URL = "/api/v1";

app.use(express.urlencoded({ extended: false }));

app.use(`${API_BASE_URL}/auth`, authRouter);

module.exports = app;
