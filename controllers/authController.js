const crypto = require("crypto");

const AppError = require("../utils/appError");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const emailSender = require("../utils/emaliSender");
const genToken = require("../utils/genToken");

exports.signUpUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });
  user.password = undefined; // so the password won't show in the output and as payload in the token
  user.__v = undefined;
  const token = genToken(user);
  return res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.signInUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError("Bad request! Email and Password is required.", 400)
    );
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isCorrectPassword(password)))
    return next(
      new AppError("Unauthenticated! Email or Password incorrect.", 401)
    );
  user.password = undefined;
  user.__v = undefined;
  const token = genToken(user);
  return res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User does not exist!", 404));
  const resetToken = user.genResetToken();
  user.save({ validateBeforeSave: false }); // persists the changes made in  genResetToken function
  const resetPasswordURL = `${process.env.CLIENT_BASE_URL}/resetPassword?token=${resetToken}`;
  const body = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LorenzoTv Password Reset</title>
  </head>
  <body>
      <div style="max-width: 600px; margin: 0 auto;">
          <header style="background-color: #3498db; padding: 20px; text-align: center; color: #fff;">
              <h1>LorenzoTv Password Reset</h1>
          </header>
          <div style="padding: 20px;">
              <p>Hello, ${user.firstName}</p>
              <p>We received a request to reset your password. To reset your password, please click the button below:</p>
              <p style="text-align: center;">
                  <a href=${resetPasswordURL} style="background-color: #3498db; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </p>
              <p>If you didn't request this password reset, you can ignore this email.</p>
              <p>Thank you!</p>
          </div>
          <footer style="background-color: #f2f2f2; padding: 20px; text-align: center;">
              <p>&copy; 2023 LorenzoTv</p>
          </footer>
      </div>
  </body>
  </html>
  `;
  const subject = "LorenzoTv Password Reset (valid for 10 min)";
  try {
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
      new AppError(
        "Something went wrong while sending a password resent link to your email. Please try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // Looks for user with the reset token and unexpired!
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiryTime: { $gt: Date.now() }, // this confirms that the token hasn't expired
  });
  if (!user)
    return next(
      new AppError("Password reset token is invalid or has expired!", 400)
    );
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
});
