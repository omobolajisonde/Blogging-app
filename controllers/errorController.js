const AppError = require("../utils/appError");

const handleDBCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDBDuplicateError = (err) => {
  const message = `Duplicate value, '${
    Object.values(err.keyValue)[0]
  }' for the '${Object.keys(err.keyPattern)[0]}' field.`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  let message;
  if (!err.errors) {
    message = err.message;
  } else {
    const values = Object.values(err.errors).map((val) => val.message);
    message = `Invalid input data! ${values.join(". ")}`;
  }

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token! Please login again.", 401);
const handleJWTExpiredError = () =>
  new AppError("Token expired! Please login again.", 401);

// Development env response for errors
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Prod env response for errors
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: "Internal server error",
      message: "Something went terribly wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "An Internal server error has occured!";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = JSON.parse(JSON.stringify(err)); // cause it is not ideal to manipulate function args. Also it was done this way cause the name property is only available when the output is JSON and not Object
    let error = err;
    if (error.name === "CastError") {
      error = handleDBCastError(error); // Returns an Instance of our AppError which ofc will add the isOperational property set to true.
    }
    if (error.code === 11000) {
      error = handleDBDuplicateError(error);
    } // handles error due to value not unique in a field with the unique constraint
    if (error.name === "ValidationError") {
      error = handleValidationError(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError(error);
    }
    sendErrorProd(error, res);
  }
};
