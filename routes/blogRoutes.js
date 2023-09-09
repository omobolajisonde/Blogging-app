const express = require("express");
const passportRequestHandler = require("../middlewares/passportHandler");

const {
  getAllBlogs,
  getAllMyBlogs,
  getBlog,
  createBlog,
  patchBlog,
  deleteBlog,
  confirmAccess,
} = require("../controllers/blogController");
const { blogValidation } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.get("/confirmAccess", passportRequestHandler, confirmAccess);

router
  .route("/")
  .get(getAllBlogs)
  .post(passportRequestHandler, blogValidation, createBlog);

router.route("/my").get(passportRequestHandler, getAllMyBlogs);

router.route("/my/:id").get(passportRequestHandler, getBlog);

router
  .route("/:id")
  .get(getBlog)
  .patch(passportRequestHandler, patchBlog)
  .delete(passportRequestHandler, deleteBlog);

module.exports = router;
