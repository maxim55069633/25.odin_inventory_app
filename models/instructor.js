const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InstructorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    bio: {type: String, maxLength: 2000},
    imgUrl: {type: String, default:""},
});

// Virtual for instructor's full name
InstructorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an instructor does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }
  return fullname;
});

// Virtual for instructor's URL
InstructorSchema.virtual("url").get(function () {
// We don't use an arrow function as we'll need the this object
return `/catalog/instructor/${this._id}`;
});

// Export model
module.exports = mongoose.model("Instructor", InstructorSchema);