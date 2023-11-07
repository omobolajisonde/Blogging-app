const Comment = require("../models/commentModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

exports.confirmAccess = catchAsync(async (req, res, next) => {
  const { blogId } = req.query;
  const blog = await Blog.findById(blogId);
  if (!blog) return next(new AppError("Blog does not exist!", 404));
  if (blog.author_id.toString() !== req.user._id)
    return next(
      new AppError(
        "Forbidden! You do not have the permission to carry out this action!",
        403
      )
    );
  return res.status(200).json({
    status: "success",
    message: "Authorized!",
  });
});

exports.getAllBlogComment = catchAsync(async (req, res, next) => {
  const { blogId } = req.query;
  const comments = await Comment.find({ blog_id: blogId });
  return res.status(200).json({
    status: "success",
    results: comments.length,
    data: {
      comments,
    },
  });
});

exports.postBlogComment = catchAsync(async (req, res, next) => {
  const { blogId, comment, user, userId } = req.body;
  const cmt = await Comment.create({
    blog_id: blogId,
    comment,
    user,
    user_id: userId,
  });
  return res.status(201).json({
    status: "success",
    data: {
      comment: cmt,
    },
  });
});

exports.editBlogComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new AppError("Comment does not exist!", 404));
  const updatedComment = await Comment.findByIdAndUpdate(commentId, req.body, {
    runValidators: true,
    new: true,
  });
  return res.status(200).json({
    status: "success",
    data: {
      comment: updatedComment,
    },
  });
});

exports.deleteBlogComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new AppError("Comment does not exist!", 404));
  await Comment.findByIdAndDelete(commentId);
  return res.status(204).json({
    status: "success",
  });
});
