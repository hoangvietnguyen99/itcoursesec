const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const categoryModel = mongoose.model('Category');

const category_getAll = async (req, res) => {
  await categoryModel.find()
    .exec((error, categories) => {
      if (error) {
        res.status(400).json({'message': 'Get categories failed.'});
      } else if (categories && categories.length > 0) {
        res.status(200).json(categories);
      } else {
        res.status(404).json({'message': 'No categories found.'});
      }
    });
}

const category_addOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      const {name} = req.body;
      if (!name) {
        return res.status(400).json({'message': 'Name are required.'});
      }
      await categoryModel.findOne({name: name})
        .exec(async (error, category) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieve categories failed.'});
          }
          if (!category) {
            await categoryModel.create({
              name: name
            }, error => {
              if (error) {
                return res.status(400).json({'message': 'Something wrong.'});
              }
              res.status(201).json({'message': 'Category added successfully.'});
            });
          } else {
            res.status(409).json({'message': 'Category already exist.'});
          }
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

const category_updateOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await categoryModel.findById(req.params.categoryId)
        .exec(async (error, category) => {
          if (error) {
            return res.status(400).json({'message': 'Retrieve category failed.'});
          }
          if (!category) {
            return res.status(404).json({'message': 'Category not found.'});
          } 
          const {name} = req.body;
          await categoryModel.findOne({name: name})
            .exec(async (error, existingCategory) => {
              if (error) {
                return res.status(400).json({'message': 'Retrieve category failed.'});
              }
              if (existingCategory) {
                return res.status(409).json({'message': 'Category already exists.'});
              }
              category.name = name;
              await category.save(error => {
                if (error) {
                  return res.status(400).json({'message': 'Save category failed.'});
                }
                res.status(200).json({'message': 'Category updated successfully.'});
              });
            });
        });
    } else {
      res.status(403).json({ 'message': 'Admin privilege is required.'});
    }
  });
}

const category_deleteOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await categoryModel.findByIdAndRemove(req.params.categoryId)
        .exec(error => {
          if (error) {
            return res.status(400).json({'message': 'Remove category failed.'});
          }
          res.status(204).json({'message': 'Category removed successfully.'});
        });
    } else {
      res.status(403).json({ 'message': 'Admin privilege is required.'});
    }
  });
}

const category_getOne = async (req, res) => {
  await categoryModel.findById(req.params.categoryId)
    .exec((error, category) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieve category failed.'});
      }
      if (!category) {
        return res.status(404).json({'message': 'Category not found.'});
      }
      res.status(200).json(category);
    });
}

module.exports = {
  category_getOne,
  category_getAll,
  category_deleteOne,
  category_updateOne,
  category_addOne
}