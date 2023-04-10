const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 100  },
  instructor: { type: Schema.Types.ObjectId, ref: "Instructor", required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  description: { type: String,  maxLength: 2000  },
  left_spots: {type: Number, required: true, default:30 }
});

// Virtual for course's URL
CourseSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/course/${this._id}`;
});

// Export model
module.exports = mongoose.model("Course", CourseSchema);