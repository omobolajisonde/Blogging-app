const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide the blog title."],
      trim: true,
      unique: true,
      minLength: [5, "Blog title cannot be lesser than 5 characters"],
      maxLength: [50, "Blog title cannot be longer than 50 characters"],
    },
    author: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
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
    tags: [String],
    // readingTime: { type: String }, readingTime is a virtual property/path
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property (does not persist in the database, but returned on query)
blogSchema.virtual("readingTime").get(function () {
  // Assuming it takes about 1 minute to read 200 words (1 min === 200 words)
  const wordsCount =
    this.title.split(" ").length +
    this.body.split(" ").length +
    (this.description ? this.description.split(" ").length : 0);
  const readingTime = wordsCount / 200;
  const IntAndDecimalParts = readingTime.toFixed(3).split(".");
  const formattedReadingTime = `${IntAndDecimalParts[0]}min ${Math.ceil(
    (IntAndDecimalParts[1] / 1000) * 60
  )}sec read`;
  return formattedReadingTime;
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
