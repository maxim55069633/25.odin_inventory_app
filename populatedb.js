#! /usr/bin/env node

console.log(
    'This script populates some test instructors, courses, categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Instructor = require("./models/instructor");
  const Course = require("./models/course");
  const Category = require("./models/category");
  
  const instructors = [];
  const courses = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createInstructors();
    await createCourses();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function categoryCreate(title) {
    const category = new Category({ title: title});
    await category.save();
    categories.push(category);
    console.log(`Added category: ${title}`);
  }
  
  async function instructorCreate(first_name, family_name, bio, imgUrl) {
    instructordetail = { first_name: first_name, family_name: family_name};  
    const instructor = new Instructor(instructordetail);
    if (bio != undefined) instructor.bio = bio;
    
    if (imgUrl == undefined) instructor.imgUrl = "/images/profile_images/default.jpg" ;
    else  instructor.imgUrl = imgUrl;

    await instructor.save();

    // instructors.push(instructor);
    console.log(`Added instructor: ${first_name} ${family_name}`);

    return instructor;
  }
  
  async function courseCreate(title,description, instructor, category , left_spots) {
    coursedetail = {
      title: title,
      instructor: instructor,
      left_spots: left_spots,
    };

    if (description != undefined) coursedetail.description = description;
    if (category != undefined) coursedetail.category = category;
  
    const course = new Course(coursedetail);
    await course.save();
    courses.push(course);
    console.log(`Added course: ${title}`);
  }
  
  async function createCategories() {
    console.log("Adding Categories");
    await Promise.all([
      categoryCreate("Health"),
      categoryCreate("Personal Development"),
      categoryCreate("Computer Science"),
    ]);
  }
  
  async function createInstructors() {
    console.log("Adding instructors");
    await Promise.all([
      instructorCreate("Patrick", "Rothfuss", undefined, undefined),
      instructorCreate("Ben", "Bova", undefined, undefined),
      instructorCreate("Isaac", "Asimov", 
      `Dr. X is a renowned expert in the field of contagious diseases, with over 20 years of experience in researching and studying various infectious diseases. He has publiinstructorsd numerous papers in leading scientific journals and has presented his research at international conferences.

      Dr. X obtained his Bachelor's degree in Biology from a prestigious university before pursuing a Master's degree in Epidemiology. He then went on to earn his PhD in Infectious Diseases from another renowned university. Throughout his academic career, Dr. X has received numerous awards and accolades for his contributions to the field.
      
      Currently, Dr. X is a professor of Contagious Diseases at a leading research university. He is also a consultant for various government agencies and international organizations, providing expert advice on the prevention and control of infectious diseases.
      
      Dr. X's research focuses on understanding the transmission and pathogenesis of various contagious diseases, including viral and bacterial infections. He is particularly interested in developing new strategies for the prevention and treatment of these diseases.
      
      In addition to his research and teaching responsibilities, Dr. X is also actively involved in community outreach programs, educating the public about the importance of vaccination and other preventative measures. He is a passionate advocate for public health and is dedicated to improving the lives of people around the world through his work.`
      , undefined),
      
      instructorCreate("Anna", "Billings", 
      `[Your Name] is a highly experienced career consultant with over 10 years of experience in the field. instructors has worked with a diverse range of clients, including recent graduates, mid-career professionals, and executives, helping them navigate their career paths and achieve their goals.

      With a background in psychology and human resources, [Your Name] has a deep understanding of the factors that influence career success, including individual strengths, interests, and values, as well as market trends and employer needs. instructors uses this knowledge to guide her clients in making informed decisions about their careers, whether they are exploring new opportunities, seeking to advance in their current roles, or transitioning to a new field.
      
      [Your Name]'s approach is highly personalized, taking into account each client's unique circumstances and goals. instructors uses a range of assessment tools and coaching techniques to help clients identify their strengths, clarify their goals, and develop strategies for achieving them. instructors also provides practical guidance on job search strategies, resume and cover letter writing, interviewing skills, and networking.
      
      Throughout her career, [Your Name] has built a reputation for her professionalism, integrity, and commitment to her clients' success. instructors has helped hundreds of individuals achieve their career goals, and is dedicated to continuing to provide high-quality career consulting services to individuals and organizations alike.`
      , undefined),
      
      instructorCreate("Giulia", "Jones", 
      `[Your Name] is a highly skilled frontend developer with [number of years] years of experience in the industry. With a passion for teaching, [Your Name] has also become a sought-after tutor for aspiring frontend developers.

      [Your Name]'s expertise lies in HTML, CSS, JavaScript, and various frontend frameworks such as React and Angular. They have worked on numerous projects for clients in various industries, including e-commerce, healthcare, and finance.
      
      As a tutor, [Your Name] has a patient and thorough approach to teaching, ensuring that their students understand the concepts and can apply them in real-world scenarios. They have taught students of all levels, from beginners to experienced developers looking to upskill.
      
      In addition to teaching, [Your Name] is also an active member of the frontend development community, regularly attending conferences and meetups to stay up-to-date with the latest trends and technologies.
      
      [Your Name]'s dedication to their craft and passion for teaching make them an invaluable resource for anyone looking to learn frontend development.`
      , "/images/profile_images/JavaScript.png"),
    ]).then(responses => {
   // test the order of instructor matters. We should push the instructor in order after the Promise.all return the results
 
      responses.map(instructor => 
        instructors.push(instructor)
        );
    });
  }
  
  async function createCourses() {
    console.log("Adding Courses");
    await Promise.all([
      courseCreate(
        "Introduction to JavaScript",
        `Welcome to the Introduction to JavaScript course! JavaScript is one of the most popular programming languages used in web development. It is a versatile language that allows developers to create dynamic and interactive web pages. In this course, you will learn the fundamentals of JavaScript, including variables, data types, functions, and control structures. You will also explore how to manipulate the Document Object Model (DOM) and add interactivity to your web pages through events and animations. By the end of this course, you will have a strong foundation in JavaScript and be able to create your own dynamic and interactive web pages. Let's get started!`,
        instructors[4],
        [categories[2]],
        1
      ),
      courseCreate(
        "Epidemiology, Intervention and Prevention",
        `Welcome to the Epidemiology, Intervention and Prevention course! This course is designed to provide you with a comprehensive understanding of the fundamental principles of epidemiology, and how they can be applied to the development and implementation of effective interventions and prevention strategies. We will explore the various methods used to study the distribution and determinants of diseases in populations, and how this knowledge can be used to identify and address health disparities. Through case studies and real-world examples, you will learn how to design and evaluate interventions aimed at improving health outcomes, and how to develop effective prevention strategies to reduce the burden of disease. By the end of this course, you will have a solid foundation in the principles of epidemiology, and be equipped with the skills needed to make a meaningful impact on public health.`,
        instructors[2],
        [categories[0]],
        22
      ),
      courseCreate(
        "Resume Writing",
        `Welcome to the Resume Writing course! This course is designed to help you create a professional and effective resume that will catch the attention of potential employers. A well-written resume can be the key to landing your dream job, and this course will provide you with the tools and knowledge you need to create a standout resume. Throughout the course, you will learn about the different types of resumes, how to tailor your resume to a specific job, and how to highlight your skills and experience. By the end of this course, you will have a poliinstructorsd and professional resume that showcases your strengths and sets you apart from other job applicants. Let's get started!`,
        instructors[3],
        [categories[1]],
        14
      ),
      courseCreate(
        "The Addiction Behaviors",
        `Welcome to the course on "The Addiction Behaviors". This course is designed to provide you with a comprehensive understanding of the various addiction behaviors that people exhibit and how they impact their lives. Addiction is a complex and multifaceted issue that affects individuals, families, and communities. It can manifest in various forms, including substance abuse, gambling, and even technology addiction. This course will explore the causes and consequences of addiction and provide practical strategies for managing and overcoming these behaviors. Whether you are a healthcare professional, a counselor, or simply someone interested in understanding addiction, this course will equip you with the knowledge and skills necessary to help individuals struggling with addiction. So, let's dive into the world of addiction and learn how to help those in need.`,
        instructors[0],
        [categories[0]],
        30
      ),
      courseCreate(
        "Test Course 1",
        "Introduction of test course 1",
        instructors[1],
        [categories[0], categories[1]],
        0
      ),
      courseCreate(
        "Test Course 2",
        "Introduction of test course 2",
        instructors[2],
        undefined,
        3
      ),
    ]);
  }
  