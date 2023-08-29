const express = require("express");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const rootController = require("./controllers/rootController");
const globalErrorMiddleware = require("./controllers/errorController");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");
const httpLogger = require("./logger/httpLogger");

const app = express();
// helmet middlewares (secures the Express app by setting various HTTP headers.)
app.use(helmet());

// enables CORS for all origins!
app.use(cors());

// HTTP logging middleware
app.use(httpLogger);

app.use(passport.initialize()); // Initialize passport
require("./middlewares/passport");

const API_BASE_URL = process.env.API_BASE_URL || "/api/v1";

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

app.get("/", rootController);
app.get("/api", rootController);
app.get("/api/v1", rootController);

app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/users`, userRouter);
app.use(`${API_BASE_URL}/blogs`, blogRouter);

// Any request that makes it to this part has lost it's way
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server! The resource you're looking for can't be found. Please check the URL before trying again.`,
  });
});

// Global error handling middleware

app.use(globalErrorMiddleware);

module.exports = app;
