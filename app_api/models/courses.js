const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const lessonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  youtubeCode: {
    type: String,
    required: true,
  }
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: String,
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  createdOn: {
    type: Date,
    'default': Date.now
  }
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  author: String,
  imgPath: String,
  description: {
    type: String
  },
  rating: {
    type: Number,
    'default': 0,
    min: 0,
    max: 5
  },
  price: {
    type: Number,
    'default': 0
  },
  tags: {
    type: [String],
    required: true
  },
  categoryId: {
    type: String,
    required: true
  },
  purchasedCount: {
    type: Number,
    'default': 0
  },
  uploadDate:{
    type: Date,
    'default': Date.now
  },
  totalCollect: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    'default': 'pending' // available || dropped || pending
  },
  reviews: [reviewSchema],
  lessons: [lessonSchema]
});

courseSchema.methods.updatePrice = function(price) {
  this.price = price;
}

courseSchema.methods.updateRating = function() {
  const count = this.reviews.length;
  const total = this.reviews.reduce((acc, {rating}) => acc + rating, 0);
  this.rating = parseInt(total / count, 10);
}

mongoose.model('Category', categorySchema);
mongoose.model('Course', courseSchema);