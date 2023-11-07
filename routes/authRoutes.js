const express = require("express");

const {
  signUpUser,
  signInUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/verifyEmail", verifyEmail);
router.post("/signin", signInUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

module.exports = router;
