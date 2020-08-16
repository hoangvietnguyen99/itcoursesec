const mongoose = require('mongoose');
const userModel = mongoose.model('User');

const getUser = async (req, res, callback) => {
  if (req.payload && req.payload.email) {
    await userModel.findOne({email : req.payload.email})
      .exec((error, user) => {
        if (error) {
          return res.status(400).json({'message': 'Get user failed.'});
        }
        if (!user) {
          return res.status(404).json({'message': "User not found."});
        }
        callback(req, res, user);
      });
  } else {
    res.status(404).json({"message": "User not found"});
  }
};

module.exports = {
  getUser
}