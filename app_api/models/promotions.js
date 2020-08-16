const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  start: Date,
  end: Date,
  discountPercent: Number, // 0-100
  status: String, // available || dropped || pending
  totalAmount: Number,
  usedCount: {
    type: Number,
    'default': 0
  },
  userClass: Number
});

promotionSchema.methods.setStatus = function(status) {
  if (status === 'available' || status === 'pending') {
    this.status = (this.end > Date.now())? status : 'dropped';
  } else this.status = status;
}

mongoose.model('Promotion', promotionSchema);