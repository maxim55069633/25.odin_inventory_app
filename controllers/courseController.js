const Course = require("../models/course");
const Instructor = require("../models/instructor");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      course_count(callback) {
        Course.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      instructor_count(callback) {
        Instructor.countDocuments({}, callback);
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Local Course Platform",
        error: err,
        data: results,
      });
    }
  );
};
  
// Display list of all Courses.
exports.course_list = function (req, res, next) {
  Course.find({}, "title instructor")
    .sort({ title: 1 })
    .populate("instructor")
    .exec(function (err, list_courses) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("course_list", { title: "Course List", course_list: list_courses });
    });
};


// Display detail page for a specific Course.
exports.course_detail = (req, res, next) => {
  async.parallel(
    {
      course(callback) {
        Course.findById(req.params.id)
          .populate("instructor")
          .populate("category")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.course == null) {
        // No results.
        const err = new Error("Course not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("course_detail", {
        title: results.course.title,
        course: results.course,
      });
    }
  );
};

// Display Course create form on GET.
exports.course_create_get = (req, res, next) => {
  // Get all instructors and categories, which we can use for adding to our course.
  async.parallel(
    {
      instructors(callback) {
        Instructor.find(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("course_form", {
        title: "Create Course",
        instructors: results.instructors,
        categories: results.categories,
      });
    }
  );
};
// Handle Course create on POST.
exports.course_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("instructor", "Instructor must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .escape(),
  body("left_spots")
    .isInt()
    .withMessage("Left Spots must be an integer.")
    .trim()
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Course object with escaped and trimmed data.
    const course = new Course({
      title: req.body.title,
      instructor: req.body.instructor,
      description: req.body.description,
      left_spots: req.body.left_spots,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all instructors and categories for form.
      async.parallel(
        {
          instructors(callback) {
            Instructor.find(callback);
          },
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (const category of results.categories) {
            if (course.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("course_form", {
            title: "Create Course",
            instructors: results.instructors,
            categories: results.categories,
            course,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save course.
    course.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new course record.
      res.redirect(course.url);
    });
  },
];

// Display Course delete form on GET.
exports.course_delete_get = (req, res, next) => {
  async.parallel(
    {
      course(callback) {
        Course.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.course == null) {
        // No results.
        res.redirect("/catalog/courses");
      }
      // Successful, so render.
      res.render("course_delete", {
        title: "Delete Course",
        course: results.course,
      });
    }
  );
};

// Handle Course delete on POST.
exports.course_delete_post = (req, res, next) => {
  async.parallel(
    {
      course(callback) {
        Course.findById(req.body.courseid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Delete object and redirect to the list of courses.
      Course.findByIdAndRemove(req.body.courseid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to course list
        res.redirect("/catalog/courses");
      });
    }
  );
};

// Display Course update form on GET.
exports.course_update_get = (req, res, next) => {
  // Get courses, instructors and categories for form.
  async.parallel(
    {
      course(callback) {
        Course.findById(req.params.id)
          .populate("instructor")
          .populate("category")
          .exec(callback);
      },
      instructors(callback) {
        Instructor.find(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.course == null) {
        // No results.
        const err = new Error("Course not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected categories as checked.
      for (const category of results.categories) {
        for (const courseCategory of results.course.category) {
          if (category._id.toString() === courseCategory._id.toString()) {
            category.checked = "true";
          }
        }
      }
      res.render("course_form", {
        title: "Update Course",
        instructors: results.instructors,
        categories: results.categories,
        course: results.course,
      });
    }
  );
};

// Handle course update on POST.
exports.course_update_post = [
  // Convert the category to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("instructor", "Instructor must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description")
    .trim()
    .escape(),
  body("left_spots", "Left Spots must not be empty")
    .trim()
    .isInt()
    .withMessage("Left Spots must be an integer.")  
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Course object with escaped/trimmed data and old id.
    const course = new Course({
      title: req.body.title,
      instructor: req.body.instructor,
      description: typeof req.body.description === "undefined" ? null : req.body.description,
      left_spots: req.body.left_spots,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all instructors and categories for form.
      async.parallel(
        {
          instructors(callback) {
            Instructor.find(callback);
          },
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (const category of results.categories) {
            if (course.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("course_form", {
            title: "Update Course",
            instructors: results.instructors,
            categories: results.categories,
            course,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Course.findByIdAndUpdate(req.params.id, course, {}, (err, thecourse) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to course detail page.
      res.redirect(thecourse.url);
    });
  },
];