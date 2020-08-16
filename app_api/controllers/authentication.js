const passport = require('passport');
const mongoose = require('mongoose');
const userModel = mongoose.model('User');
const cartModel = mongoose.model('Cart');
const regexp = require('../middleware/regexp');

const register = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) { // Responds with an error status if not all required fields are found
    return res.status(400)
      .json({
        "message": "All fields required"
      });
  }
  userModel.findOne({email: req.body.email})
    .exec((error, user) => {
      if (error) {
        res.status(400)
          .json({
            'message': 'Something wrong.'
          });
      } else if (user) {
        res.status(409)
          .json({
            'message': 'User already exist.'
          });
      } else {
        const {name, email, password} = req.body;
        if (!name || !email || !password) return res.status(400).json({'message': 'All fields are required.'});
        if (!regexp.email.test(email)) return res.status(400).json({'message': 'Your email is not valid.'});
        // if (!regexp.password.test(password)) return res.status(400).json({'message': 'Your password is not valid.'});
        const user = new userModel(); // Creates a new user instance, and sets the name and email
        user.name = name;
        user.email = email;
        user.setPassword(password); // Uses the setPassword method to set the salt and hash
        user.save(async (error, user) => { // Saves the new user to MongoDB
          if (error) return res.status(404).json({'message': 'Save user failed'});
          await cartModel.create({userId: user._id}, error => {
            if (error) res.status(400).json({'message': 'Create cart failed.'});
            const token = user.generateJsonwebtoken(); // Generates a Jsonwebtoken, using the schema method, and sends it to the browser
            res.status(201).json({token});
          });
        });
      }
    });
};

const login = (req, res) => {
  if (!req.body.email || !req.body.password) { // Validates that the required fields have been supplied
    return res.status(400)
      .json({
        "message": "All fields required"
      });
  }
  passport.authenticate('local', (error, user, info) => { // Passes the name of the strategy and a callback to authenticate method
    let token;
    if (error) { // Returns an error if Passport returns an error
      return res.status(404)
        .json({
          'message': 'Something wrong.'
        });
    }
    if (user) { // If Passport returned a user instance, generates and sends a Jsonwebtoken
      token = user.generateJsonwebtoken();
      res.status(200)
        .json({token});
    } else { //Otherwise, returns an info message (why authentication failed)
      res.status(401)
        .json(info);
    }
  })(req, res); // Makes sure that req and res are available to Passport
};

module.exports = {
  register,
  login
};