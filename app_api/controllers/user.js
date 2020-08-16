const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const userModel = mongoose.model('User');

const admin_getAllUsers = (req, res) => { //Admin get all users
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await userModel.find()
        .exec((error, users) => {
          if (error) return res.status(400).json({'message': 'Something wrong.'});
          if (users) {
            res.status(200).json(users);
          } else res.status(404).json({'message': 'No user found.'});
        });
    } else res.status(403).json({"message": "Admin privilege is required."});
  });
}

const admin_getAllUsersV2 = (req, res) => { //Admin get all users
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
      const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
      const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;
      await userModel.find()
        .select('-tags -purchasedCourseIds -salt -hash')
        .exec((error, users) => {
          if (error) {
            return res.status(400).json({'message': 'Something wrong.'});
          }
          if (users) {
            const totalCount = users.length;
            users.sort((a, b) => b[sortBy] - a[sortBy]);
            const returnUsers = users.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
            res.status(200).json({
              items: returnUsers,
              pageIndex: pageIndex,
              pageSize: pageSize,
              totalCount: totalCount
            });
          } else {
            res.status(404).json({'message': 'No user found.'});
          }
        });
    } else {
      res.status(403).json({"message": "Admin privilege is required."});
    }
  });
}

const user_getOne = async (req, res) => {
  await userModel.findById(req.params.userId)
    .select('name imgPath createdOn')
    .exec((error, user) => {
      if (error) {
        return res.status(400).json({'message': 'Retrieves user failed.'});
      }
      if (user) {
        return res.status(200).json(user);
      } 
      res.status(404).json({'message': 'User not found.'});
    });
}

const user_userGetOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user._id == req.params.userId) {
      return res.status(200).json(user);
    } else if (user.isAdmin) {
      await userModel.findById(req.params.userId)
        .select('-hash -salt')
        .exec((error, user) => {
          if (error) return res.status(400).json({'message': 'Retrieves user failed.'});
          if (user) return res.status(200).json(user);
          res.status(404).json({'message': 'User not found.'});
        });
    } else {
      await userModel.findById(req.params.userId)
        .select('name imgPath createdOn')
        .exec((error, user) => {
          if (error) res.status(400).json({'message': 'Retrieves user failed.'});
          if (user) return res.status(200).json(user);
          res.status(404).json({'message': 'User not found.'});
        });
    }
  });
}

const user_updateOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user._id === req.params.userId)
    {
      const type = req.body.type;
      if (type == 'information') {
        const {name, gender, phone, dateOfBirth, imgPath} = req.body;
        if (!name || !imgPath || !gender || !phone) {
          return res.status(400).json({'message': 'All fields are required.'});
        }
        user.name = name;
        const dob = Date.parse(dateOfBirth);
        user.age = (Date.now()).getFullYear() - dob.getFullYear();
        user.dateOfBirth = dob,
        user.gender = gender;
        user.phone = phone;
        await user.save(error => {
          if (error) {
            return res.status(400).json({'message': 'Save user failed.'});
          }
          res.status(200).json({'message': 'User updated successfully.'});
        });        
      } else if (type == 'password') {
        const p = req.body.password;
        user.setPassword(p);
        await user.save((error) => {
          if (error) {
            return res.status(400).json({'message': 'Password changed failed.'});
          }
          res.status(200).json({'message': 'Password changed successfully.'});
        });
      } else {
        res.status(400).json({'message': 'Invalid type of update.'});
      }
    } else {
      res.status(403).json({'message': 'You are not authorized to edit this user.'});
    }
  }
)}

const user_deleteOne = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin) {
      await userModel.findByIdAndRemove(req.body.userId)
        .exec(error => {
          if (error) {
            return res.status(400).json({'message': 'Delete user failed.'});
          }
          res.status(204).json({'message': 'User deleted successfully.'});
        });
    } else {
      res.status(403).json({'message': 'Admin privilege is required.'});
    }
  });
}

module.exports = {
  admin_getAllUsers,
  admin_getAllUsersV2,
  user_userGetOne,
  user_deleteOne,
  user_updateOne,
  user_getOne
}