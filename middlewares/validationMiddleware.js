const Joi = require("joi");

const catchAsync = require("../utils/catchAsync");

exports.blogValidation = catchAsync(async (req, res, next) => {
  await blogSchema.validateAsync(req.body);
  next();
});

const blogSchema = Joi.object({
  title: Joi.string().required().min(5).max(50),
  description: Joi.string(),
  body: Joi.string().required(), // strings are trimmed by default
  state: Joi.string().default("draft").valid("draft", "published"),
  createdAt: Joi.date().max("now").default(Date.now()),
  lastUpdatedAt: Joi.date().min(Joi.ref("createdAt")).default(Date.now()),
  readCount: Joi.number().min(0).default(0),
  tags: Joi.array().items(Joi.string()),
});
