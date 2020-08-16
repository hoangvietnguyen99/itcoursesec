const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const promotionModel = mongoose.model('Promotion');

const admin_addPromotion = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) {
      return res.status(403).json({'message': 'Admin privilege is required.'})
    }
    const {code, start, end, discountPercent, totalAmount} = req.body.promotion;
    if (!code || !start || !end || !discountPercent || !totalAmount) {
      return res.status(400).json({'message': 'All fields are required.'});
    }
    await promotionModel.findOne({code: code})
      .exec(async (error, promotion) => {
        if (error) return res.status(400).json({'message': 'Retrieve promotion failed.'});
        if (promotion) {
          return res.status(409).json({'message': 'Promotion already exist.'});
        }
        const userClass = (req.body.userClass)? parseInt(req.body.userClass) : 0;
        const status = (req.body.status)? req.body.status : 'pending';
        await promotionModel.create({
          code: code,
          start: Date.parse(start),
          end: Date.parse(end),
          discountPercent: parseInt(discountPercent),
          totalAmount: parseInt(totalAmount),
          status: status,
          userClass: userClass
        }, error => {
          if (error) {
            return res.status(400).json({'message': 'Create promotion failed.'});
          }
          res.status(201).json({'message': 'Create promotion successfully.'});
        });
      });
  });
}

const admin_getAllPromotions = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) {
      return res.status(403).json({'message': 'Admin privilege is required.'});
    }   
    await promotionModel.find()
      .exec((error, promotions) => {
        if (error) {
          return res.status(400).json({'message': 'Retrieve promotions failed.'});
        }
        if (!promotions || promotions.length == 0) {
          return res.status(404).json({'message': 'No promotions found.'});
        }
        res.status(200).json(promotions);
      });
  });
}

const admin_getAllPromotionsV2 = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) {
      return res.status(403).json({'message': 'Admin privilege is required.'});
    }
    const sortBy = (req.body.sortBy)? req.body.sortBy : "_id";
    const pageSize = (req.body.pageSize)? parseInt(req.body.pageSize) : 50;
    const pageIndex = (req.body.pageIndex)? parseInt(req.body.pageIndex) : 1;    
    await promotionModel.find()
      .exec((error, promotions) => {
        if (error) {
          return res.status(400).json({'message': 'Retrieve promotions failed.'});
        }
        if (!promotions || promotions.length == 0) {
          return res.status(404).json({'message': 'No promotions found.'});
        }
        const totalCount = promotions.length;
        promotions.sort((a, b) => b[sortBy] - a[sortBy]);
        const returnItems = promotions.slice(pageSize*(pageIndex - 1), pageSize*(pageIndex))
        res.status(200).json({
          items: returnItems,
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalCount: totalCount
        });
      });
  });
}

const admin_editPromotion = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    const type = req.body.type;
    if (type != 'status') return res.status(400).json({'message': 'Edit status only.'});
    const {_id, code, status} = req.body;
    if (!status) return res.status(400).json({'message': 'Status is required.'});
    if (status != 'available' && status != 'pending' && status != 'drop') return res.status(400).json({'message': 'Status type is invalid.'});
    if (!code && !_id) return res.status(400).json({'message': 'All fields are required.'});
    if (_id) {
      await promotionModel.findById(_id)
        .exec(async (error, promotion) => {
          if (error) return res.status(400).json({'message': 'Retrieve promotion failed.'});
          if (!promotion) return res.status(404).json({'message': 'Promotion not found.'});
          promotion.status = status;
          await promotion.save(error => {
            if (error) return res.status(400).json({'message': 'Save promotion failed.'});
            res.status(200).json({'message': 'Promotion saved successfully.'});
          });
        });
    } else if (code) {
      await promotionModel.findOne({code: code})
      .exec(async (error, promotion) => {
        if (error) return res.status(400).json({'message': 'Retrieve promotion failed.'});
        if (!promotion) return res.status(404).json({'message': 'Promotion not found.'});
        promotion.status = status;
        await promotion.save(error => {
          if (error) return res.status(400).json({'message': 'Save promotion failed.'});
          res.status(200).json({'message': 'Promotion saved successfully.'});
        });
      });  
    }
  });
}

const promotion_setStatus = (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    const promotionCode = req.body.code;
    promotionModel.findOne({code: promotionCode})
      .exec((error, promotion) => {
        if (error) return res.status(400).json({'message': 'Get promotion failed.'});
        if (!promotion) return res.status(404).json({'message': 'Promotion not found.'});
        const promotionStatus = req.body.status;
        if (promotionStatus !== 'pending' && promotionStatus !== 'available' && promotionStatus !== 'dropped') return res.status(400).json({'message': 'Invalid promotion status.'});
        promotion.setStatus(promotionStatus);
        promotion.save(error => {
          if (error) return res.status(400).json({'message': 'Save promotion failed.'});
          res.status(200).json('Promotion status updated.');
        })
      })
  });
}

const admin_deletePromotion = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    if (user.isAdmin)
    {  
      const [promotion] = await Promise.all([
        promotionModel.findOne({code: req.params.code})
      ]);
      console.log(promotion);
      promotionModel.remove(promotion, (err) => {
        if (err) return res.status(400).json({'message': 'Delete promotion failed.'});
        res.status(204).json({'message': 'Promotion deleted successfully.'});
      });
    }
    else res.status(403).json({'message': 'Admin privilege is required.'});
  });
}

module.exports = {
  admin_addPromotion,
  admin_getAllPromotions,
  admin_getAllPromotionsV2,
  admin_editPromotion,
  admin_deletePromotion,
  promotion_setStatus
}