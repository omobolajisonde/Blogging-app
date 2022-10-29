const express = require("express");
const passport = require("passport");

const authRouter = require("./routes/authRoutes");

const app = express();

app.use(passport.initialize()); // Initialize passport
require("./middlewares/passport");

const API_BASE_URL = "/api/v1";

app.use(express.urlencoded({ extended: false }));

app.use(`${API_BASE_URL}/auth`, authRouter);

module.exports = app;
