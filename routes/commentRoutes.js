const express = require("express");
const passportRequestHandler = require("../middlewares/passportHandler");

const {
  getAllBlogComment,
  editBlogComment,
  deleteBlogComment,
  postBlogComment,
} = require("../controllers/commentController");
const {
  commentQueryValidation,
  commentValidation,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router
  .route("/")
  .get(commentQueryValidation, getAllBlogComment)
  .post(commentValidation, postBlogComment);

router
  .route("/:commentId")
  .patch(commentValidation, passportRequestHandler, editBlogComment)
  .delete(passportRequestHandler, deleteBlogComment);

module.exports = router;
