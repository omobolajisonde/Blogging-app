const express = require("express");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");

const app = express();

// helmet middlewares (secures the Express app by setting various HTTP headers.)
app.use(helmet());

app.use(passport.initialize()); // Initialize passport
require("./middlewares/passport");

const API_BASE_URL = "/api/v1";

// Body parsers middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// xss attacks and NoSQL query injection prevention middlewares
app.use(mongoSanitize()); // sanitizes user-supplied data to prevent MongoDB Operator Injection
app.use(xss()); // sanitize user input coming from POST body, GET queries, and url params

// Middleware to prevent http parameter pollution
app.use(hpp());

// Middleware for rate limiting
const apiLimiter = rateLimit({
  max: 100, // max allowable number of request from an IP address in a given timeframe
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from your IP address, please try again later.",
});
app.use("/api", apiLimiter); // Use to limit repeated requests to public APIs

app.use("/", (req, res, next) => {
  return res.redirect("/blogs");
});
app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/users`, userRouter);
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
