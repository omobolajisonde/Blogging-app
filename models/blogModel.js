const mongoose = require("mongoose");
const User = require("./userModel");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide the blog title."],
      trim: true,
      minLength: [5, "Blog title cannot be lesser than 5 characters"],
      maxLength: [50, "Blog title cannot be longer than 50 characters"],
    },
    author: { type: ObjectId, required: true },
    description: { type: String, trim: true },
    body: {
      type: String,
      trim: true,
      required: [true, "Please provide the blog body."],
    },
    state: {
      type: String,
      trim: true,
      default: "draft",
      enum: {
        values: ["draft", "published"],
        message: "A blog can only be in two states, draft or published.",
      },
    },
    timestamp: { type: Date, default: Date.now() },
    readCount: { type: Number, default: 0 },
    readingTime: { type: String },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property (does not persist in the database, but returned on query)
blogSchema.virtual("readingTime").get(function () {
  // Assuming it takes about 1 minute to read 200 words (1 min === 200 words)
  const wordsCount =
    this.title.split(" ").length +
    this.body.split(" ").length +
    this.description?.split(" ").length;
  const readingTime = wordsCount / 200;
  const IntAndDecimalParts = readingTime.toString().split(".");
  const formattedReadingTime = `${IntAndDecimalParts[0]} min ${
    IntAndDecimalParts[1] * 60
  } sec read`;
  return formattedReadingTime;
});
