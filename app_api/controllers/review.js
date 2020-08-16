const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const courseModel = mongoose.model('Course');

const review_getAllByCourse = async (req, res) => {
  await courseModel.findById(req.params.courseId)
    .exec((error, course) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves course failed.'});
      }
      if (!course) {
        return res.status(404).json({'message': 'Course not found.'});
      }
      if (course.reviews && course.reviews.length > 0) {
        return res.status(200).json(course.reviews);
      }
      res.status(404).json({'message': 'No reviews found.'});
    });
}

const review_addOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.purchasedCourseIds.includes(req.params.courseId)) {
      await courseModel.findById(req.params.courseId)
        .exec(async (error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'})
          }
          const reviewUsers = course.reviews.map(review => review.userName);
          if (reviewUsers.includes(user.name)) {
            return res.status(409).json({'message': 'You can only add one review to this course.'});
          }
          const {comment, rating} = req.body;
          if (!comment || !rating) {
            return res.status(400).json({'message': 'All fields are required.'});
          }
          course.reviews.push({
            userId: user._id,
            userName: user.name,
            comment: comment,
            rating: parseInt(rating)
          });
          course.updateRating();
          await course.save(error => {
            if (error) {
              return res.status(400).json({'message': 'Saves course failed.'});
            }
            res.status(201).json({'message': 'Review added successfully.'});
          })
        });
    } else {
      res.status(403).json({'message': 'You are not authorized to add a review to this course.'});
    }
  });
}

const review_getOne = async (req, res) => {
  await courseModel.findById(req.params.courseId)
    .exec((error, course) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves course failed.'});
      }
      if (!course) {
        return res.status(404).json({'message': 'Course not found.'});
      }
      const review = course.reviews.find(item => item._id == req.params.reviewId);
      if (review) {
        return res.status(200).json(review);
      }
      res.status(404).json({'message': 'Review not found.'});
    });
}

const review_updateOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    await courseModel.findById(req.params.courseId)
      .exec((error, course) => {
        if (error) {
          return res.status(400).json({'message': 'Retrieves course failed.'});
        }
        if (!course) {
          return res.status(404).json({'message': 'Course not found.'});
        }
        const review = course.reviews.find(item => item._id == req.params.reviewId);
        if (review) {
          if (review.userId == user._id) {
            const {comment, rating} = req.body;
            if (!comment || !rating) {
              return res.status(400).json({'message': 'All fields are required.'});
            }
            review.comment = comment;
            review.rating = parseInt(rating);
            course.updateRating();
            course.save(error => {
              if (error) {
                return res.status(400).json({'message': 'Save course failed.'});
              }
              res.status(200).json({'message': 'Review updated successfully.'});
            });
          } else {
            res.status(403).json({'message': 'You are not authorized to edit this review.'});
          }
        } else {
          res.status(404).json({'message': 'Review not found.'});
        }
      });
  });
}

const review_deleteOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    await courseModel.findById(req.params.courseId)
      .exec(async (error, course) => {
        if (error) {
          return res.status(400).json({'message': 'Retrieves course failed.'});
        }
        if (!course) {
          return res.status(404).json({'message': 'Course not found.'});
        }
        const review = course.reviews.find(item => item._id == req.params.reviewId);
        if (review) {
          if (user.isAdmin || user._id == review.userId) {
            course.reviews = course.reviews.filter(item => item._id == req.params.reviewId);
            course.updateRating();
            await course.save(error => {
              if (error) {
                return res.status(400).json({'message': 'Saves course failed.'});
              }
              res.status(204).json({'message': 'Review deleted successfully.'});
            });
          } else {
            res.status(403).json({'message': 'You are not authorized to delete this review.'});
          }
        } else {
          res.status(404).json({'message': 'Review not found.'});
        }
      });
  });
}

module.exports = {
  review_deleteOne,
  review_updateOne,
  review_getOne,
  review_addOne,
  review_getAllByCourse
}