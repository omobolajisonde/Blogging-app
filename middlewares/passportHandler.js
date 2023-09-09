const passport = require("passport");

module.exports = function (req, res, next) {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err || !user) {
      const error = err ? err : info;
      error.isOperational = true;
      error.statusCode = 401;
      error.status = "failed";
      if (error instanceof SyntaxError) {
        error.message = "Please login or signup to access this resource.";
      }
      // PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
      return next(error);
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
};
