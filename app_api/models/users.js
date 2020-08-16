const mongoose = require("mongoose");
const crypto = require("crypto"); // build-in module
const jsonwebtoken = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: Number,
  gender: String,
  phone: String,
  dateOfBirth: String,
  hash: String,
  salt: String,
  imgPath: String,
  isAdmin: {
    type: Boolean,
    'default': false
  },
  tags: [String],
  purchasedCourseIds: [String],
  totalSpend: {
    type: Number,
    'default': 0
  },
  createdOn: {
    type: Date,
    'default': Date.now
  },
  class: {
    type: Number,
    'default': 0
  }
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex'); // Creates a random string for the salt
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512') // Creates an encrypted hash
    .toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512') // Hashes the provided password
    .toString('hex');
  return this.hash === hash; // Checks the password hash against the hash
};

userSchema.methods.generateJsonwebtoken = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Creates an expiry date objects and sets it for seven days
  return jsonwebtoken.sign(
    {
      // Calls the jsonwebtoken.sign method and returns what it returns
      _id: this._id,
      name: this.name,
      email: this.email,
      imgPath: this.imgPath,
      isAdmin: this.isAdmin,
      exp: parseInt(expiry.getTime() / 1000, 10), // Include exp as UNIX time in seconds
    },
    process.env.JWT_SECRET
  ); // Sends secret for hashing algorithm to use
};

mongoose.model("User", userSchema);
