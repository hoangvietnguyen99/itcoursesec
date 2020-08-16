// const crypto = require('crypto'); // build-in module
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const userModel = mongoose.model('User');

passport.use(new localStrategy({
    usernameField: 'email' // Overrides the username field in the option object with email field
  }, (email, password, done) => {
    userModel.findOne({ email: email }, (error, user) => { // Searches MongoDB for a user with the supplied email address
      if (error) {
        return done(error);
      }
      if (!user) { // If no user is found, returns false and a message
        return done(null, false, {
          message: 'Incorrect email.'
        });
      }
      if (!user.validPassword(password)) { // Calls the validPassword method, passing the supplied password
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      return done(null, user); // If you've reached the end, you can return the user object
    });
  }
));