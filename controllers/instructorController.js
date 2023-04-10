const Instructor = require("../models/instructor");
const async = require("async");
const Course = require("../models/course");
const { body, validationResult } = require("express-validator");

// Display list of all Instructors.
exports.instructor_list = function (req, res, next) {
    Instructor.find()
      .sort([["family_name", "ascending"]])
      .exec(function (err, list_instructors) {
        if (err) {
          return next(err);
        }
        //Successful, so render
        res.render("instructor_list", {
          title: "Instructor List",
          instructor_list: list_instructors,
        });
      });
};


// Display detail page for a specific instructor.
exports.instructor_detail = (req, res, next) => {
    async.parallel(
      {
        instructor(callback) {
          Instructor.findById(req.params.id).exec(callback);
        },
        instructors_courses(callback) {
          Course.find({ instructor: req.params.id }, "title description").exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          // Error in API usage.
          return next(err);
        }
        if (results.instructor == null) {
          // No results.
          const err = new Error("Instructor not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render.
        res.render("instructor_detail", {
          title: "Instructor Detail",
          instructor: results.instructor,
          instructor_courses: results.instructors_courses,
        });
      }
    );
  };

// Display Instructor create form on GET.
exports.instructor_create_get = (req, res, next) => {
  res.render("instructor_form", { title: "Create Instructor" });
};

// Handle Instructor create on POST.
exports.instructor_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("bio").trim().escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("instructor_form", {
        title: "Create Instructor",
        instructor: req.body,
        errors: errors.array(),
      });
      return;
    }

    // Create an Instructor object with escaped and trimmed data.
    const instructor = new Instructor({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      bio:  typeof req.body.bio === undefined ? undefined : req.body.bio,
    });
    if(req.file===undefined)
      instructor.imgUrl = "/images/profile_images/default.jpg";
    else
      instructor.imgUrl = `/images/profile_images/${req.file.filename}`;

    instructor.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new instructor record.
      res.redirect(instructor.url);
    });
  },
];

// Display Instructor delete form on GET.
exports.instructor_delete_get = (req, res, next) => {
  async.parallel(
    {
      instructor(callback) {
        Instructor.findById(req.params.id).exec(callback);
      },
      instructors_courses(callback) {
        Course.find({ instructor: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.instructor == null) {
        // No results.
        res.redirect("/catalog/instructors");
      }
      // Successful, so render.
      res.render("instructor_delete", {
        title: "Delete Instructor",
        instructor: results.instructor,
        instructor_courses: results.instructors_courses,
      });
    }
  );
};

// Handle Instructor delete on POST.
exports.instructor_delete_post = (req, res, next) => {
  async.parallel(
    {
      instructor(callback) {
        Instructor.findById(req.body.instructorid).exec(callback);
      },
      instructors_courses(callback) {
        Course.find({ instructor: req.body.instructorid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.instructors_courses.length > 0) {
        // Instructor has courses. Render in same way as for GET route.
        res.render("instructor_delete", {
          title: "Delete Instructor",
          instructor: results.instructor,
          instructor_courses: results.instructors_courses,
        });
        return;
      }
      // Instructor has no courses. Delete object and redirect to the list of instructors.
      Instructor.findByIdAndRemove(req.body.instructorid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to instructor list
        res.redirect("/catalog/instructors");
      });
    }
  );
};

// Display Instructor update form on GET.
exports.instructor_update_get = (req, res, next) => {
  async.parallel(
    {
      instructor(callback) {
        Instructor.findById(req.params.id)
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.instructor == null) {
        // No results.
        const err = new Error("Instructor not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("instructor_form", {
        title: "Update Instructor",
        instructor: results.instructor,
      });
    }
  );
};

// Handle Instructor update on POST.
exports.instructor_update_post = [
  // Validate and sanitize fields.
 // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("bio").trim().escape(),
 
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Instructor object with escaped/trimmed data and old id.
    const instructor = new Instructor({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      bio:  typeof req.body.bio === undefined ? undefined : req.body.bio,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if(req.file===undefined)
      instructor.imgUrl = "/images/profile_images/default.jpg";
    else
      instructor.imgUrl = `/images/profile_images/${req.file.filename}`;

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      async.parallel(
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("instructor_form", {
            title: "Update Instructor",
            instructor,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Instructor.findByIdAndUpdate(req.params.id, instructor, {}, (err, theinstructor) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to instructor detail page.
      res.redirect(theinstructor.url);
    });
  },
];
