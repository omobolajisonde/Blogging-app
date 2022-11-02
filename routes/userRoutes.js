const express = require("express");
const passport = require("passport");

const {
  getAllUsers,
  getUser,
  updateMe,
  deleteBlog,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getAllUsers);
router
  .route("/:id")
  .get(getUser)
  .patch(passport.authenticate("jwt", { session: false }), updateMe)
  .delete(passport.authenticate("jwt", { session: false }), deleteBlog);

module.exports = router;
