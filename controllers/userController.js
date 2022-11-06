const User = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const genToken = require("../utils/genToken");

const filterBody = (body, ...allowableFields) => {
  const filteredBody = {};
  Object.keys(body).forEach((field) => {
    if (allowableFields.includes(field)) filteredBody[field] = body[field];
  });
  return filteredBody;
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const processedQuery = new ApiFeatures(User.find(), req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const users = await processedQuery.query;
    return res.status(200).json({
      status: "success",
      results: users.length,
      page: req.query.page || 1,
      data: {
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return next(new Error("User does not exist!"));
    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    // Prevent password update here
    if (req.body.password || req.body.confirmPassword)
      return next(
        new Error(
          "This route is not meant for password updates. Use /users/updateMyPassword instead."
        )
      );
    // Filter the incoming update
    const filteredBody = filterBody(req.body, "firstName", "lastName", "email");
    // Update
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true, // runs validators for only updated fields, unlike save (validateBeforeSave) which runs for all fields regardless
    });
    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMyPassword = async (req, res, next) => {
  try {
    // 1. Get the User
    const user = await User.findById(req.user._id).select("+password");

    // 2. Check the provided password
    const { currentPassword, password, confirmPassword } = req.body;
    // Checks if current password is indeed provided
    if (!currentPassword) {
      return next(new Error("Provide your current password."));
    }
    if (!(await user.isCorrectPassword(currentPassword))) {
      return next(new Error("Incorrect password!"));
    }

    // 3. Update password
    // Checks if password and confirmPassword is indeed provided
    if (!password || !confirmPassword) {
      return next(new Error("Enter your new password and confirm it."));
    }
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save({ validateBeforeSave: true });

    // 4. Log user in freshly, basically sending a fresh JWT
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
  } catch (error) {
    next(error);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
