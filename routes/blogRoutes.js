const express = require("express");
const passport = require("passport");

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

router.get(
  "/confirmAccess",
  passport.authenticate("jwt", { session: false }),
  confirmAccess
);

router
  .route("/")
  .get(getAllBlogs)
  .post(
    passport.authenticate("jwt", { session: false }),
    blogValidation,
    createBlog
  );

router
  .route("/my")
  .get(passport.authenticate("jwt", { session: false }), getAllMyBlogs);

router
  .route("/my/:id")
  .get(passport.authenticate("jwt", { session: false }), getBlog);

router
  .route("/:id")
  .get(getBlog)
  .patch(passport.authenticate("jwt", { session: false }), patchBlog)
  .delete(passport.authenticate("jwt", { session: false }), deleteBlog);

module.exports = router;
