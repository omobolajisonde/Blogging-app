const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const User = require("../models/userModel");
const AppError = require("../utils/appError");

passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Check if the user associated with token still exists
        const claimUser = await User.findById(payload.user._id);
        if (!claimUser) {
          return done(
            new AppError("User associated with token no longer exists.", 401)
          );
        }
        // Check if the password has been changed after token was issued
        const passwordModified = claimUser.passwordModified(payload.iat);
        if (passwordModified)
          return done(
            new AppError(
              "Invalid token! User changed password after this token was issued. Signin again to get a new token.",
              401
            )
          );
        // Grant access!
        done(null, payload.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
