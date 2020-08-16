const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const courseModel = mongoose.model('Course');
const categoryModel = mongoose.model('Category');
const userModel = mongoose.model('User');

const course_addOne = async (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      const {name, imgPath, description, price, tags, lessons} = req.body;
      const categoryId = req.params.categoryId;
      if (!name || !imgPath || !description || !price || !tags || !lessons)
      {
        return res.status(400).json({'message': 'All fields are required.'});
      }
      await courseModel.findOne({categoryId: req.params.categoryId, name: name})
        .exec(async (error, course) => {
          if (error) {
            res.status(400).json({'message': 'Find course failed.'});
          } else if (!course) {
            course = {
              name: name,
              author: user.name,
              imgPath: imgPath,
              description: description,
              price: parseInt(price),
              tags: tags.split(','),
              categoryId: categoryId,
              lessons: JSON.parse(lessons)
            }
            await courseModel.create(course, error => {
              if (error) {
                res.status(400).json({'message': 'Create course failed.'});
              } else {
                res.status(201).json({'message': 'Course added successfully.'});
              }
            });
          } else {
            res.status(409).json({'message': 'Course already exist.'});
          }
      });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const course_getAll = async (req, res) => {
  await courseModel.find({status: 'available'})
    .select('-lessons -totalCollect')
    .exec((error, courses) => {
      if (error) return res.status(400).json({'message': 'Retrieves courses failed.'});
      if (!courses) return res.status(404).json({'message': 'No courses found.'});
      // const cs = courses.map(item => {                    
      //   const category = categories.find(category => category._id == item.categoryId);
      //   item.categoryId = category.name;
      //   return item;
      // });
      res.status(200).json(courses);
    });
}

const user_getFreeCourse = (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    const courseId = req.body.courseId;
    if (!courseId) return res.status(404).json({'message': 'CourseId not found.'});
    courseModel.findOne({_id: courseId, status: 'available', price: 0}, (err, course) => {
      if (err) return res.status(400).json({'message': 'Retrieve course failed.'});
      if (!course) return res.status(404).json({'message': `Course not found.`});
      if (user.purchasedCourseIds.includes(courseId)) return res.status(409).json({'message': 'Course already in your list.'});
      course.purchasedCount++;
      userModel.findById(user._id)
        .exec((error, tempUser) => {
          if (error) return res.status(400).json({'message': 'Retrieve user failed.'});
          if (!tempUser) return res.status(404).json({'message': 'User not found.'});
          for (let i = 0; i < course.tags.length; i++) {
            tempUser.tags.push(course.tags[i]);
          }
          tempUser.tags = [...new Set(tempUser.tags)];
          tempUser.purchasedCourseIds.push(course._id);
          tempUser.save(error => {
            if (error) return res.status(400).json({'message': 'Save tempUser failed.'});
            course.save(error => {
              if (error) return res.status(400).json({'message': 'Save course failed.'});
              res.status(200).json({'message': 'Get course successfully.'});
            });
          });
        });      
    });
  })
}

const course_getAllV2 = async (req, res) => {
  const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
  const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
  const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;
  await courseModel.find({status: 'available'})
    .select('-lessons -totalCollect')
    .exec((error, courses) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves courses failed.'});
      }
      if (!courses) {
        return res.status(404).json({'message': 'No courses found.'});
      }
      // const cs = courses.map(item => {                    
      //   const category = categories.find(category => category._id == item.categoryId);
      //   item.categoryId = category.name;
      //   return item;
      // });
      const totalCount = courses.length;
      courses.sort((a, b) => b[sortBy] - a[sortBy]);
      const returnCourses = courses.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
      res.status(200).json({
        items: returnCourses,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount
      });
    });
}

const course_getAllPurchasedCoursesV2 = (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
    const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
    const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;
    const purchasedCourses = user.purchasedCourseIds.map(async courseId => {
      let tempCourse;
      await courseModel.findById(courseId)
        .exec((error, course) => {
          if (course) {
            tempCourse = course;
          }
        });
      return tempCourse;
    });
    const totalCount = purchasedCourses.length;
    purchasedCourses.sort((a, b) => b[sortBy] - a[sortBy]);
    const returnCourses = purchasedCourses.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
    res.status(200).json({
      items: returnCourses,
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalCount: totalCount
    });
  })
}

const course_getAllPurchasedCourses = (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    const purchasedCourses = user.purchasedCourseIds.map(async courseId => {
      let tempCourse;
      await courseModel.findById(courseId)
        .exec((error, course) => {
          if (course) {
            tempCourse = course;
          }
        });
      return tempCourse;
    });
    res.status(200).json(purchasedCourses);
  })
}

const course_getAllByCategoryV2 = async (req, res) => {
  const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
  const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
  const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;
  await categoryModel.findById(req.params.categoryId)
    .exec(async (error, category) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves category failed.'});
      }
      if (!category) {
        return res.status(404).json({'message': 'No category found.'});
      } else {
        await courseModel.find({categoryId: category._id, status: 'available'})
          .select('-lessons -totalCollect')
          .exec((error, courses) => {
            if (error) {
              return res.status(400).json({'message': 'Retrieves course failed.'});
            }
            if (!courses) {
              return res.status(404).json({'message': 'No course found.'});
            }
            const totalCount = courses.length;
            courses.sort((a, b) => b[sortBy] - a[sortBy]);
            const returnCourses = courses.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
            res.status(200).json({
              items: returnCourses,
              pageIndex: pageIndex,
              pageSize: pageSize,
              totalCount: totalCount
            });
          });
      }
    });
}

const course_getAllByCategory = async (req, res) => {
  await categoryModel.findById(req.params.categoryId)
    .exec(async (error, category) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves category failed.'});
      }
      if (!category) {
        return res.status(404).json({'message': 'No category found.'});
      } else {
        await courseModel.find({categoryId: category._id, status: 'available'})
          .select('-lessons -totalCollect')
          .exec((error, courses) => {
            if (error) return res.status(400).json({'message': 'Retrieves course failed.'});
            if (!courses) return res.status(404).json({'message': 'No course found.'});
            res.status(200).json(courses);
          });
      }
    });
}

const admin_getAllCourses = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await courseModel.find()
        .exec(async (error, courses) => {
          if (error) return res.status(400).json({'message': 'Retrieves course failed.'});
          if (!courses) return res.status(404).json({'message': 'No course found.'});
          await categoryModel.find()
            .exec((error, categories) => {
              if (error) return res.status(400).json({'message': 'Retrieves categories failed.'});
              if (categories && categories.length > 0) {
                const cs = courses.map(item => {
                  const category = categories.find(category => category._id == item.categoryId);
                  if (category) item.categoryId = category.name;
                  return item;
                });
                res.status(200).json(cs);
              } else {
                res.status(404).json({'message': 'No categories found.'});
              }
            });
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const course_updateOne = (req, res) => {
  // middleware.getUser(req, res, async (req, res, user) => {
  //   if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
  //   const course = JSON.parse(req.body.course);
  //   const doc = await courseModel.findById(course._id);
  //   doc.overwrite(course);
  //   await doc.save(error => {
  //     if (error) return res.status(400).json({'message': 'Save doc failed.'});
  //     res.status(200).JSON({'message': 'Doc successfully updated.'});
  //   });
  // })
  res.status(404).json({'message': 'On going feature.'});
}

const admin_getAllCoursesV2 = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
    const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
    const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;
    if (user.isAdmin) {
      await courseModel.find()
        .select('-lessons -reviews -tags -description')
        .exec(async (error, courses) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!courses) {
            return res.status(404).json({'message': 'No course found.'});
          } 
          await categoryModel.find()
            .exec((error, categories) => {
              if (error) {
                return res.status(400).json({'message': 'Retrieves categories failed.'});
              }
              if (categories) {
                const cs = courses.map(item => {                    
                  const category = categories.find(category => category._id == item.categoryId);
                  item.categoryId = category.name;
                  return item;
                });
                const totalCount = cs.length;
                cs.sort((a, b) => b[sortBy] - a[sortBy]);
                const returnCourses = cs.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
                res.status(200).json({
                  items: returnCourses,
                  pageIndex: pageIndex,
                  pageSize: pageSize,
                  totalCount: totalCount
                });
              } else {
                res.status(404).json({'message': 'No categories found.'});
              }
            });
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const course_userGetOne = (req, res) => {
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
            res.status(200).json(course);
        });
    } else {
      await courseModel.findById(req.params.courseId)
        .select('-lessons')
        .exec((error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          } 
          res.status(200)
            .json(course);
        });
    }
  });
}

const course_getOne = async (req, res) => {
  await courseModel.findById(req.params.courseId)
    .select('-lessons')
    .exec((error, course) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves course failed.'});
      }
      if (!course) {
        return res.status(404).json({'message': 'Course not found.'});
      }
      res.status(200)
        .json(course);
    });
}

const course_setStatus = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      const courseId = req.params.categoryId;
      const setStatus = req.body.status;
      if (!setStatus || (setStatus != 'available' && setStatus != 'pending' && setStatus != 'deleted')) {
        return res.status(400).json({'message': 'Invalid status.'});
      }
      if (!courseId) {
        return res.status(400).json({'message': 'All fields are required.'});
      }
      await courseModel.findById(courseId)
        .exec(async (error, course) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieves course failed.'});
          }
          if (!course) {
            return res.status(404).json({'message': 'Course not found.'});
          }
          course.status = setStatus;
          await course.save(error => {
            if (error) {
              return res.status(400).json({'message': 'Save course failed.'});
            }
            res.status(200).json({'message': 'Course successfully saved.'});
          });
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const course_deleteOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await courseModel.findByIdAndRemove(req.params.courseId)
        .exec(error => {
          if (error) {
            return res.status(400).json({'message': 'Removed course failed.'});
          }
          res.status(204).json({'message': 'Course deleted successfully.'});
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

module.exports = {
  course_addOne,
  course_getAll,
  course_getAllV2,
  course_deleteOne,
  course_getAllByCategory,
  course_getAllByCategoryV2,
  course_userGetOne,
  course_getOne,
  course_setStatus,
  admin_getAllCourses,
  course_getAllPurchasedCoursesV2,
  course_getAllPurchasedCourses,
  admin_getAllCoursesV2,
  course_updateOne,
  user_getFreeCourse
}