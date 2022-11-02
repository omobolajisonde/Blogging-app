const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const emailSender = require("../utils/emaliSender");

const genToken = function (user) {
  const payload = { user };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.signUpUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
    user.password = undefined; // so the password won't show in the output and as payload in the token
    const token = genToken(user);
    return res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.signInUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new Error("Bad request! Email and Password is required."));
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.isCorrectPassword(password)))
      return next(new Error("Unauthenticated! Email or Password incorrect."));
    user.password = undefined;
    const token = genToken(user);
    return res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User does not exist!"));
  try {
    const resetToken = user.genResetToken();
    user.save({ validateBeforeSave: false }); // persists the changes made in  genResetToken function
    const resetPasswordURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetPassword/${resetToken}`;
    const body = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: <a href=${resetPasswordURL}>${resetPasswordURL}</a>.\nIf you didn't forget your password, please ignore this email!`;
    const subject = "Your password reset token (valid for 10 min)";
    await emailSender({ email, body, subject });
    return res.status(200).json({
      status: "success",
      message:
        "Check your email inbox, a link to reset your password has been sent.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiryTime = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);
    return next(
      new Error(
        "Something went wrong while sending a password resent link to your email. Please try again later."
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // Looks for user with the reset token and unexpired!
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiryTime: { $gt: Date.now() }, // this confirms that the token hasn't expired
    });
    if (!user)
      return next(new Error("Password reset token is invalid or has expired!"));
    const { password, confirmPassword } = req.body;
    // Resets the password
    user.password = password;
    user.confirmPassword = confirmPassword;
    // clears the passwordResetToken details on successful password update
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiryTime = undefined;
    await user.save({ validateModifiedOnly: true }); // saves and update the passwordModifiedAt field
    // 4) Log the user in, send JWT
    user.password = undefined;
    user.passwordModifiedAt = undefined;
    const jwttoken = genToken(user);
    return res.status(200).json({
      status: "success",
      token: jwttoken,
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};
