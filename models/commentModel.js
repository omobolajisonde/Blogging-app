const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const commentSchema = new Schema(
  {
    blog_id: {
      type: ObjectId,
      ref: "Blog",
    },
    comment: {
      type: String,
      trim: true,
    },
    user: {
      type: String,
    },
    user_id: {
      type: ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
