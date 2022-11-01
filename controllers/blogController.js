const Blog = require("../models/blogModel");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAllBlogs = async (req, res, next) => {
  try {
    const processedQuery = new ApiFeatures(
      Blog.find({ state: "published" }),
      req.query
    )
      .filter()
      .sort()
      .project()
      .paginate();
    const blogs = await processedQuery.query;
    return res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllMyBlogs = async (req, res, next) => {
  try {
    const queryFilter = { author_id: req.user._id };
    const processedQuery = new ApiFeatures(Blog.find(queryFilter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const blogs = await processedQuery.query;
    return res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id, state: "published" }).populate({
      path: "author_id",
      select: "-__v",
    });
    if (!blog) return next(new Error("Blog does not exist!"));
    blog.readCount += 1; // Increases the blog's read by 1
    await blog.save(); // persist it
    return res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const blogData = {
      ...req.body,
      author: `${req.user.firstName} ${req.user.lastName}`,
      author_id: req.user._id,
    };
    const { title, body, description } = blogData;
    if (!title || !body)
      return next(
        new Error("Bad request! Blog must have both title and body.")
      );
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
  } catch (error) {
    next(error);
  }
};

exports.patchBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    if (!blog) return next(new Error("Blog does not exist!"));
    if (blog.author_id.toString() !== req.user._id)
      return next(
        new Error(
          "Forbidden! You do not have the permission to carry out this action!"
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
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    if (!blog) return next(new Error("Blog does not exist!"));
    if (blog.author_id.toString() !== req.user._id)
      return next(
        new Error(
          "Forbidden! You do not have the permission to carry out this action!"
        )
      );
    await Blog.findByIdAndDelete(id);
    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
