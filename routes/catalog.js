const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path")
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, './public/images/profile_images');
    },
    filename:(req, file, cb)=>{
        cb(
            null,
            file.fieldname+"-"+Date.now()+ path.extname(file.originalname)
        );
    },
});
const upload = multer({storage: storage});

// Require controller modules.
const course_controller = require("../controllers/courseController");
const instructor_controller = require("../controllers/instructorController");
const category_controller = require("../controllers/categoryController");

// GET catalog home page.
router.get("/", course_controller.index);

// GET request for creating a Course. NOTE This must come before routes that display Course (uses id).
router.get("/course/create", course_controller.course_create_get);

// POST request for creating Course.
router.post("/course/create", course_controller.course_create_post);

// GET request to delete Course.
router.get("/course/:id/delete", course_controller.course_delete_get);

// POST request to delete Course.
router.post("/course/:id/delete", course_controller.course_delete_post);

// GET request to update Course.
router.get("/course/:id/update", course_controller.course_update_get);

// POST request to update Course.
router.post("/course/:id/update", course_controller.course_update_post);

// GET request for one Course.
router.get("/course/:id", course_controller.course_detail);

// GET request for list of all Course items.
router.get("/courses", course_controller.course_list);

/// INSTRUCTOR ROUTES ///

// GET request for creating INSTRUCTOR. NOTE This must come before route for id (i.e. display instructor).
router.get("/instructor/create", instructor_controller.instructor_create_get);

// POST request for creating INSTRUCTOR.
router.post("/instructor/create", upload.single("image"), instructor_controller.instructor_create_post);

// GET request to delete INSTRUCTOR.
router.get("/instructor/:id/delete", instructor_controller.instructor_delete_get);

// POST request to delete INSTRUCTOR.
router.post("/instructor/:id/delete", instructor_controller.instructor_delete_post);

// GET request to update INSTRUCTOR.
router.get("/instructor/:id/update", instructor_controller.instructor_update_get);

// POST request to update INSTRUCTOR.
router.post("/instructor/:id/update",upload.single("image"), instructor_controller.instructor_update_post);

// GET request for one INSTRUCTOR.
router.get("/instructor/:id", instructor_controller.instructor_detail);

// GET request for list of all INSTRUCTORs.
router.get("/instructors", instructor_controller.instructor_list);

/// CATEGORY ROUTES ///

// GET request for creating a CATEGORY. NOTE This must come before route that displays CATEGORY (uses id).
router.get("/category/create", category_controller.category_create_get);

//POST request for creating CATEGORY.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete CATEGORY.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete CATEGORY.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update CATEGORY.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update CATEGORY.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one CATEGORY.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all CATEGORY.
router.get("/categories", category_controller.category_list);

module.exports = router;