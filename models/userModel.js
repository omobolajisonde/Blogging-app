const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your firstname."],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your lastname."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email address."],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email address."],
  },
  password: {
    type: String,
    required: [
      true,
      "It's a dangerous world online! Please provide a password.",
    ],
    minLength: 6,
    select: false, // doesn't add this field on Read query
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password."],
    minLength: 6,
    select: false,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords must match.",
    },
  },
});

// Pre hook for hashing password before save
userSchema.pre("save", async function () {
  // Hashes the password of the currently processed document
  const hashedPassword = await bcrypt.hash(this.password, 12);
  // Overwrite plain text password with hash
  this.password = hashedPassword;
  // Clear the confirm password field
  this.confirmPassword = undefined;
});

// document method for checking correct password
userSchema.methods.isCorrectPassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
