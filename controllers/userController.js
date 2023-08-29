const User = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const genToken = require("../utils/genToken");

const filterBody = (body, ...allowableFields) => {
  const filteredBody = {};
  Object.keys(body).forEach((field) => {
    if (allowableFields.includes(field)) filteredBody[field] = body[field];
  });
  return filteredBody;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
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
});

exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) return next(new AppError("User does not exist!", 404));
  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent password update here
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError(
        "This route is not meant for password updates. Use /users/updateMyPassword instead.",
        403
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
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1. Get the User
  const user = await User.findById(req.user._id).select("+password");

  // 2. Check the provided password
  const { currentPassword, password, confirmPassword } = req.body;
  // Checks if current password is indeed provided
  if (!currentPassword) {
    return next(new AppError("Provide your current password.", 400));
  }
  if (!(await user.isCorrectPassword(currentPassword))) {
    return next(new AppError("Incorrect password!", 401));
  }

  // 3. Update password
  // Checks if password and confirmPassword is indeed provided
  if (!password || !confirmPassword) {
    return next(new AppError("Enter your new password and confirm it.", 400));
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
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  return res.status(204).json({
    status: "success",
    data: null,
  });
});
