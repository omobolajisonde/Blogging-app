const express = require("express");
const passport = require("passport");

const authRouter = require("./routes/authRoutes");
const blogRouter = require("./routes/blogRoutes");

const app = express();

app.use(passport.initialize()); // Initialize passport
require("./middlewares/passport");

const API_BASE_URL = "/api/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/blogs`, blogRouter);

// Any request that makes it to this part has lost it's way
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An Internal server error has occured!";
  return res.status(statusCode).json({
    status: "failed",
    message: message,
  });
});

module.exports = app;
