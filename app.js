require('dotenv').config({path: './.env'});
const createError = require("http-errors");
const express = require("express");
const cors = require('cors');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const passport = require('passport'); // Requires Passport before the model definition
require("./app_api/models/db");
require('./app_api/config/passport'); // Requires strategy after the model definition

const flash = require("connect-flash");

//Routes: insert routes here
// const indexRouter = require("./app_server/routes/index");
// const usersRouter = require("./app_server/routes/users");
// const loginRouter = require("./app_server/routes/login");
// const registerRouter = require("./app_server/routes/register");
// const profileRouter = require("./app_server/routes/profile");
// const coursesRouter = require("./app_server/routes/courses");
// const courseRouter = require("./app_server/routes/course");
// const userCoursesRouter = require("./app_server/routes/user-courses");

const apiRouter = require('./app_api/routers/index');

const app = express();
app.use(cors());
// view engine setup
// app.set("views", path.join(__dirname, "app_server/views"));
// app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// app.use(
//   session({
//     secret: "secret",
//     saveUninitialized: true,
//     resave: true,
//   })
// );

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages");
  next();
});

//Routes: insert routes here
// app.use("/", indexRouter);
// app.use("/users", usersRouter);
// app.use("/login", loginRouter);
// app.use("/register", registerRouter);
// app.use("/profile", profileRouter);
// app.use("/courses", coursesRouter);
// app.use("/course", courseRouter);
// app.use("/user-courses", userCoursesRouter);

// app.use('/api', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// error handlers
// Catch unauthorized errors
app.use((error, req, res, next) => {
  if (error.name === 'UnauthorizedError') {
    res.status(401)
      .json({
        "message": error.name + ": " + error.message
      });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// var schedule = require('node-schedule');
// const mongoose = require('mongoose');
// const discountModel = mongoose.model('Discount');
// const courseModel = mongoose.model('Course');

// var j = schedule.scheduleJob('* */1 * * *', function() {
//   console.log('The answer to life, the universe, and everything!');
//   discountModel.find()
//     .exec((error, discounts) => {
//       if (error) {
//         console.log(error);
//       } else if (discounts && discounts.length > 0) {
//         discounts = discounts.filter(item => item.active !== 'inactive');
//         for (let i = 0; i < discounts.length; i++) {
//           const discount = discounts[i];
//           discount.setActive();
//           courseModel.findById(discount.courseId)
//             .exec((error, course) => {
//               if (course) {
//                 if (discount.active === 'inactive') {
//                   course.setPrice(discount.oldPrice);
//                 } else if (discount.active === 'active') {
//                   course.setPrice(course.price*(100 + discount.discountPercent)/100);
//                 }
//                 course.save((error) => console.log(error));
//               }
//             });
//           discount.save((error) => console.log(error));
//         }
//       } else {
//         console.log("No discount available.");
//       }
//   });
// });

module.exports = app;
