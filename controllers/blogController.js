const Blog = require("../models/blogModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const query = Blog.find({ state: "published" });
  const processedQuery = new ApiFeatures(query, req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const blogs = await processedQuery.query;
  return res.status(200).json({
    status: "success",
    results: await Blog.countDocuments({ state: "published" }),
    page: req.query.page || 1,
    data: {
      blogs,
    },
  });
});

exports.getAllMyBlogs = catchAsync(async (req, res, next) => {
  const queryFilter = { author_id: req.user._id };
  const processedQuery = new ApiFeatures(Blog.find(queryFilter), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const blogs = await processedQuery.query;
  return res.status(200).json({
    status: "success",
    results: await Blog.countDocuments({ author_id: req.user._id }),
    page: req.query.page || 1,
    data: {
      blogs,
    },
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  let queryFilter = { _id: id, state: "published" };
  if (req.user) {
    delete queryFilter.state;
  }
  const blog = await Blog.findOne(queryFilter).populate({
    path: "author_id",
    select: "-__v",
  });
  if (!blog) return next(new AppError("Blog does not exist!", 404));
  blog.readCount += 1; // Increases the blog's read by 1
  await blog.save(); // persist it
  return res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const blogData = {
    ...req.body,
    author: `${req.user.firstName} ${req.user.lastName}`,
    author_id: req.user._id,
  };
  const { title, body, description } = blogData;
  // Assuming it takes about 1 minute to read 200 words (1 min === 200 words)
  const wordsCount =
    title.split(" ").length +
    body.split(" ").length +
    (blogData.description ? blogData.description.split(" ").length : 0);
  const readingTime = wordsCount / 200;
  blogData.readingTime = readingTime; // setting the blog reading time before creating
  const blog = await Blog.create(blogData);
  return res.status(201).json({
    status: "success",
    data: {
      blog,
    },
  });
});

exports.patchBlog = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const blog = await Blog.findById(id);
  if (!blog) return next(new AppError("Blog does not exist!", 404));
  if (blog.author_id.toString() !== req.user._id)
    return next(
      new AppError(
        "Forbidden! You do not have the permission to carry out this action!",
        403
      )
    );
  req.body.lastUpdatedAt = Date.now(); // updates the lastUpdatedAt to the present
  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  return res.status(200).json({
    status: "success",
    data: {
      blog: updatedBlog,
    },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const blog = await Blog.findById(id);
  if (!blog) return next(new AppError("Blog does not exist!", 404));
  if (blog.author_id.toString() !== req.user._id)
    return next(
      new AppError(
        "Forbidden! You do not have the permission to carry out this action!",
        403
      )
    );
  await Blog.findByIdAndDelete(id);
  return res.status(204).json({
    status: "success",
    data: null,
  });
});
