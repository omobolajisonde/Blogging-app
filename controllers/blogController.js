const Blog = require("../models/blogModel");

exports.getAllBlogs = async (req, res, next) => {
  try {
    const queryFilter = { state: "published" };
    const blogs = await Blog.find(queryFilter);
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
    const queryFilter = { author: req.user._id };
    const blogs = await Blog.find(queryFilter);
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
      path: "author",
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
      author: req.user._id,
    };
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
    if (blog.author.toString() !== req.user._id)
      return next(
        new Error(
          "Forbidden! You do not have the permission to carry out this action!"
        )
      );
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
    if (blog.author.toString() !== req.user._id)
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
