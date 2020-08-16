//Map API request to appropriate controller
const express = require("express");
const router = express.Router();
const expressJwt = require("express-jwt");

// const multipart = require("connect-multiparty");
// const multipartyMiddleware = multipart({
//   uploadDir: "./upload",
// });

const auth = expressJwt({
  secret: process.env.JWT_SECRET, // Sets the secret using the same environment variable as before
  userProperty: "payload", // Defines a property on req to be the payload
});

const authenticationController = require("../controllers/authentication");
const userController = require("../controllers/user");
const categoryController = require("../controllers/category");
const courseController = require("../controllers/course");
const lessonController = require("../controllers/lesson");
const reviewController = require("../controllers/review");
const cartController = require("../controllers/cart");
const promotionController = require("../controllers/promotion");

const currencyConvert = require("../middleware/currencyconvert");

const analyticsController = require("../controllers/analytic");

/**
 * Category API
 */
router
  .route("/categories")
  /**
   * -- req.body:
   * name
   * imgPath
   */
  .post(auth, categoryController.category_addOne)
  .get(categoryController.category_getAll);

router
  .route("/category/:categoryId")
  .get(categoryController.category_getOne)
  /**
   * -- req.body:
   * name
   * imgPath
   */
  .put(auth, categoryController.category_updateOne)
  .delete(auth, categoryController.category_deleteOne);

router
  .route("/category/:categoryId/coursesv2")
  .get(courseController.course_getAllByCategoryV2);

/**
 * Course API
 */
router
  .route("/category/:categoryId/courses")
  .get(courseController.course_getAllByCategory)
  /**
   * -- req.body:
   * name
   * imgPath
   * description
   * price
   * tags
   */
  .post(auth, courseController.course_addOne)
  .put(auth, courseController.course_updateOne);

router.route("/coursesv2").get(courseController.course_getAllV2);

router.route("/courses").get(courseController.course_getAll);

router
  .route("/course/:courseId")
  .get(auth, courseController.course_userGetOne)
  .put(auth, courseController.course_setStatus)
  .delete(auth, courseController.course_deleteOne);

// API get ONE course for Guests
router.route("/guest/course/:courseId").get(courseController.course_getOne);

router.route("/guest/user/:userId").get(userController.user_getOne); //API xem profile user khi khong co account

router
  .route("/course/:courseId/lessons")
  .get(auth, lessonController.lesson_getAllByCourse)
  /**
   * -- req.body:
   * name
   * content
   * youtubeCode
   * imgPath
   */
  .post(auth, lessonController.lesson_addOne);

router
  .route("/course/:courseId/lesson/:lessonId")
  .get(auth, lessonController.lesson_getOne)
  /**
   * -- req.body:
   * name
   * content
   * youtubeCode
   * imgPath
   */
  .put(auth, lessonController.lesson_updateOne)
  .delete(auth, lessonController.lesson_deleteOne);

/**
 * Review API
 */
router
  .route("/course/:courseId/reviews")
  .get(reviewController.review_getAllByCourse)
  /**
   * -- req.body:
   * comment
   * rating
   */
  .post(auth, reviewController.review_addOne);

router
  .route("/course/:courseId/reviews/:reviewId")
  .get(reviewController.review_getOne)
  /**
   * -- req.body:
   * comment
   * rating
   */
  .put(auth, reviewController.review_updateOne)
  .delete(auth, reviewController.review_deleteOne);

//API ADMIN
// router.route('/admin/users')
//   .get(auth, userController.admin_getAll);
router.route("/admin/courses").get(auth, courseController.admin_getAllCourses);

router.route("/admin/users").get(auth, userController.admin_getAllUsers); //ADMIN API get ALL users

router.route("/admin/paidcarts")
  .get(auth, cartController.admin_getAllPaidCarts);

router
  .route("/admin/promotions")
  .get(auth, promotionController.admin_getAllPromotions)
  /**
   * -- req.body:
   * code, start, end, discountPercent, totalAmount, userClass(optional), status(optional)
   */
  .post(auth, promotionController.admin_addPromotion)
  /**
   * -- req.body:
   * _id || code, status
   * type: information || status
   */
  .put(auth, promotionController.admin_editPromotion);
  /**
   * -- req.body:
   * _id || code
   */

router.route('/admin/promotion/setstatus')
  .put(auth, promotionController.promotion_setStatus);

router.route('/admin/promotions/:code')
  .delete(auth, promotionController.admin_deletePromotion);

/**
 * Cart API
 */
router
  .route("/cart")
  .get(auth, cartController.cart_getCurrent) //API lấy cart hiện tại
  .delete(auth, cartController.cart_dropCurrent);

router
  .route("/cart/items")
  /**
   * -- req.body:
   * courseId
   */
  .post(auth, cartController.cart_addItem)
  .put(auth, cartController.cart_removeItem);

router.route('/freecourse')
  .post(auth, courseController.user_getFreeCourse);

router
  .route("/cart/promotion")
  /**
   * --req.body:
   * promotionCode
   */
  .post(auth, cartController.cart_addPromotionV2)
  .put(auth, cartController.cart_removePromotionV2);

router
  .route("/user/:userId")
  .get(auth, userController.user_userGetOne)
  /**
   * -- req.body:
   * type = 'information' || 'password'
   * name
   * age
   * gender
   * phone
   * address
   * dateOfBirth
   */
  .put(auth, userController.user_updateOne)
  .delete(auth, userController.user_deleteOne);

router.route("/pay")
  .post(auth, cartController.cart_finishPaymentV2);

router.route("/payv2")
  .post(auth, cartController.cart_finishPayment);

router.route("/currency")
  .post(currencyConvert.convertCurrencyAPI);

router.post("/register", authenticationController.register);

router.post("/login", authenticationController.login);

router.route('/analytic/revenue')
  .post(auth, analyticsController.getRevenueOfYear);

router.route('/analytic/trendtags')
  .post(auth, analyticsController.getTrendTagsData);

// router.post("/uploadimg", multipartyMiddleware, (req, res) => {
//   console.log(req.body, req.files)
//   res.status(201).json({ message: "Image upload successfully." });
// });

module.exports = router;
