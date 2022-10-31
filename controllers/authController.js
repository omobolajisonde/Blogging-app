const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

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

// exports.signUpUser = (req,res,next)=>{

// }
