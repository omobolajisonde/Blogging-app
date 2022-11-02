const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
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
      type: String,
      required: [true, "A blog must have an author."],
    },
    author_id: {
      type: ObjectId,
      required: [true, "Please provide the blog author's Id."],
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
    createdAt: { type: Date, default: Date.now() },
    lastUpdatedAt: { type: Date, default: Date.now() },
    readCount: { type: Number, default: 0 },
    tags: [String],
    readingTime: { type: Number, required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property (does not persist in the database, but returned on query)
blogSchema.virtual("formattedReadingTime").get(function () {
  if (!this.readingTime) return undefined;
  const IntAndDecimalParts = this.readingTime.toFixed(3).split(".");
  const formattedReadingTime = `${IntAndDecimalParts[0]}min ${Math.ceil(
    (IntAndDecimalParts[1] / 1000) * 60
  )}sec read`;
  return formattedReadingTime;
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
