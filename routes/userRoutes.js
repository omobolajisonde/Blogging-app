const express = require("express");
const passportRequestHandler = require("../middlewares/passportHandler");

const {
  getAllUsers,
  getUser,
  updateMe,
  updateMyPassword,
  deleteMe,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/:id").get(getUser);
router.route("/updateMe").patch(passportRequestHandler, updateMe);
router
  .route("/updateMyPassword")
  .patch(passportRequestHandler, updateMyPassword);

router.route("/deleteMe").delete(passportRequestHandler, deleteMe);

module.exports = router;
