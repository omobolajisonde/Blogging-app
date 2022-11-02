const express = require("express");
const passport = require("passport");

const {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/:id").get(getUser);
router
  .route("/updateMe")
  .patch(passport.authenticate("jwt", { session: false }), updateMe);
router
  .route("/deleteMe")
  .delete(passport.authenticate("jwt", { session: false }), deleteMe);

module.exports = router;
