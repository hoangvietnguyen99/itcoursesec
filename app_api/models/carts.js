const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
	courseId: String,
	courseName: String,
	coursePrice: Number,
	insertDate: {
		type: Date,
		'default': Date.now
	}
});

const cartSchema = new mongoose.Schema({
	userId: String,
	items: [itemSchema],
	isCurrent: {
		type: Boolean,
		'default': true
	},
	promotionCode: String,
	total: {
		type: Number,
		'default': 0
	},
	totalAfterPromoted: Number,
	paymentMethod: {
		type: String,
		'default': ''
	},
	isPaid: {
		type: Boolean,
		'default': false
	},
	paidDate: {
		type: Date
	}
});

cartSchema.methods.updateTotal = function() {
	this.total = this.items.reduce((acc, {coursePrice}) => acc + coursePrice, 0);
	this.totalAfterPromoted = this.total;
}

cartSchema.methods.addItem = function(item) {
	this.items.push(item);
	this.updateTotal();
}

cartSchema.methods.removeItem = function(courseId) {
	this.items = this.items.filter(item => item.courseId != courseId);
	this.updateTotal();
}

cartSchema.methods.addPromotion = function(promotion) {
	this.promotionCode = promotion.code;
	this.totalAfterPromoted = this.total*(100 - promotion.discountPercent) / 100;
}

cartSchema.methods.removePromotion = function() {
	this.promotionCode = '';
	this.totalAfterPromoted = this.total;
}

mongoose.model('Cart', cartSchema);