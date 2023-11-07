const crypto = require("crypto");
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
  emailIsVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordModifiedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpiryTime: Date,
  emailVerificationToken: String,
  emailVerificationTokenExpiresIn: Date,
});

// Query /find/ middleware/hook
// userSchema.pre(/^find/, async function () {
//   this.find({ emailIsVerified: { $ne: false } });
// });

// Pre document hook for hashing password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // prevents hashing of unmodified password
  // Hashes the password of the currently processed document
  const hashedPassword = await bcrypt.hash(this.password, 12);
  // Overwrite plain text password with hash
  this.password = hashedPassword;
  // Clear the confirm password field
  this.confirmPassword = undefined;
  next();
});

// Pre document hook to update the passwordModifiedAt field after password change
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next(); // prevents update of passwordModifiedAt field for unmodified password or new document
  this.passwordModifiedAt = Date.now() - 1500; // Setting it to 1.5s in the past because, although we awaited the saving the actual saving in to the db might happen just after the jwt is issued which will then render our token useless. So, setting it just a bit in the past helps us prevent this scenario
  next();
});

// document method for checking correct password
userSchema.methods.isCorrectPassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

// document method for checking if password has been modified after token was issued
userSchema.methods.passwordModified = function (JWT_IAT) {
  if (!this.passwordModifiedAt) return false;
  const JWT_IAT_TS = new Date(JWT_IAT * 1000).toISOString(); // gets the ISO string timestamp of JWT IAT (milliseconds)
  // console.log(new Date(this.passwordModifiedAt), "🎯🎯", new Date(JWT_IAT_TS));
  return new Date(JWT_IAT_TS) < new Date(this.passwordModifiedAt);
};

// document method for generating reset Token
userSchema.methods.genResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiryTime = Date.now() + 10 * 60 * 1000;
  return token;
};

userSchema.methods.genEmailVerificationToken = function () {
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  this.emailVerificationTokenExpiresIn = Date.now() + 60 * 60 * 1000; // An hour
  return emailVerificationToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
