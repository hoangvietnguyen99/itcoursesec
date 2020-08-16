const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const courseModel = mongoose.model('Course');

const lesson_getAllByCourse = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin || user.purchasedCourseIds.includes(req.params.courseId)) {
      await courseModel.findById(req.params.courseId)
        .exec((error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          }
          if (course.lessons.length > 0) {
            return res.status(200).json(course.lessons);
          }
          res.status(404).json({'message': 'No lessons found.'});
        });
    } else {
      res.status(403).json({'message': 'You are not authorized to view this resource.'});
    }
  })
  
}

const lesson_addOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await courseModel.findById(req.params.courseId)
        .exec((error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found'});
          }
          const {name, youtubeCode} = req.body;
          if (!name || !youtubeCode) {
            return res.status(400).json({'message': 'All fields are required.'});
          }
          const temp = course.lessons.find(lesson => lesson.name == name);
          if (temp) {
            return res.status(409).json({'message': 'Lesson already exist.'});
          }
          course.lessons.push({
            name: name,
            youtubeCode: youtubeCode
          });
          course.save(error => {
            if (error) {
              return res.status(400).json({'message': 'Saves course failed.'});
            }
            res.status(201).json({'message': 'Lesson added successfully.'});
          });
        });
    } else {
      res.status(403)
        .json({'message': 'Admin privilege is required.'});
    }
  });
}

const lesson_getOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.idAmin || user.purchasedCourseIds.includes(req.params.courseId)) {
      await courseModel.findById(req.params.courseId)
        .exec((error, course) => {
          if (error) {
            res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          }
            const lesson = course.lessons.find(item => item._id == req.params.lessonId);
            if (lesson) {
              return res.status(200).json(lesson);
            }
            return res.status(404).json({'message': 'Lesson not found.'});
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const lesson_updateOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await courseModel.findById(req.params.courseId)
        .exec((error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          }
          const lesson = course.lessons.find(lesson => lesson._id == req.params.lessonId);
          const {name, youtubeCode} = req.body;
          if (!name || !youtubeCode) {
            return res.status(400).json({'message': 'All fields are required.'});
          }
          const temp = course.lessons.find(lesson => lesson.name == name);
          if (temp) {
            return res.status(409).json({'message': 'Lesson already exist.'});
          }
          if (lesson) {
            lesson.name = name;
            lesson.youtubeCode = youtubeCode;
            course.save(error => {
              if (error) {
                return res.status(400).json({'message': 'Saves course failed.'});
              }
              res.status(200).json({'message': 'Lesson updated successfully.'});
            });
          } else {
            res.status(404).json({'message': 'Lesson not found.'});
          }
        });
    } else {
      res.status(403)
        .json({'message': 'Admin privilege is required.'});
    }
  });
}

const lesson_deleteOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await courseModel.findById(req.params.courseId)
        .exec(async (error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Something wrong.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          }
          const lesson = course.lessons.find(item => item._id == req.params.lessonId);
          if (!lesson) {
            return res.status(404).json({'message': 'Lesson not found.'});
          }
          course.lessons = course.lessons.filter(item => item._id != req.params.lessonId);
          await course.save(error => {
            if (error) {
              return res.status(400).json({'message': 'Saves course failed.'});
            }
            res.status(204).json({'message': 'Lesson deleted successfully.'});
          });
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

module.exports = {
  lesson_deleteOne,
  lesson_updateOne,
  lesson_getOne,
  lesson_getAllByCourse,
  lesson_addOne
}