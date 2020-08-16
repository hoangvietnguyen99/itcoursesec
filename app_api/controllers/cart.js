const mongoose = require('mongoose');
const middleware = require('../middleware/middleware');
const cartModel = mongoose.model('Cart');
const courseModel = mongoose.model('Course');
const promotionModel = mongoose.model('Promotion');
const userModel = mongoose.model('User');

const getAvailablePromotion = async (promotionCode) => {
  let result;
  await promotionModel.findOne({code: promotionCode, status: 'available'})
    .exec((error, promotion) => {
      if (error) return result = null;
      result = promotion;
    });
  return result;
}

const cart_dropCurrent = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    await cartModel.findOne({userId: user._id, isCurrent: true})
      .exec(async (error, cart) => {
        if (error) {
          return res.status(400).json({'message': 'Retrieve cart failed.'});
        }
        if (!cart) {
          await cartModel.create({userId: user._id}, error => {
            if (error) {
              return res.status(400).json({'message': 'Create new cart failed'});
            }
            res.status(400).json({'message': 'Can not find a valid cart.'});
          });
        } else {
          if (cart.items.length > 0) {
            cart.isCurrent = false;
            await cartModel.create({userId: user._id}, error => {
              if (error) {
                return res.status(400).json({'message': 'Create new cart failed.'});
              }
              res.status(204).json({'message': 'Drop cart successfully.'});
            });
          } else {
            res.status(400).json({'message': 'Can not drop an empty cart.'});
          }
        }
      });
  });
}

const admin_getAllPaidCarts = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    cartModel.find({isPaid: true}, (err, carts) => {
      if (err) return res.status(400).json({'message': 'Retrieve cart failed.'});
      if (!carts || carts.length == 0) return res.status(404).json({'message': 'No carts found.'});
      carts = carts.sort((a, b) => b.paidDate - a.paidDate);
      res.status(200).json(carts);
    });
  });
}

const cart_getCurrent = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    await cartModel.findOne({userId: user._id, isCurrent: true})
      .exec(async (error, cart) => {
        if (error) return res.status(400).json({'message': 'Retrieves cart failed.'});
        if (cart) {
          if (cart.promotionCode) {
            const [validPromotion] = await Promise.all([
              promotionModel.findOne({code: cart.promotionCode, status: 'available'})
            ]);
            if (!validPromotion) {
              cart.removePromotion();
              await cart.save((error, saveCart) => {
                if (error) return res.status(400).json({'message': 'Save cart failed.'});
                res.status(200).json(saveCart);
              });
            } else {
              return res.status(200).json(cart);
            }
          } else {
            return res.status(200).json(cart);
          }
        }
        await cartModel.create({userId: user._id}, (error, newCart) => {
          if (error) {
            return res.status(400).json({'message': 'Create cart failed.'});
          }
          res.status(200).json(newCart);
        });
      });
  });
}

const cart_addItem = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    const courseId = req.body.courseId;
    if (user.purchasedCourseIds.includes(courseId)) return res.status(409).json({'message': 'Course already purchased.'});
    await cartModel.findOne({userId: user._id, isCurrent: true})
      .exec(async (error, cart) => {
        if (error) return res.status(400).json({'message': 'Retrieve cart failed.'});
        if (!cart) {
          await cartModel.create({userId: user._id}, async (error, cart) => {
            if (error) return res.status(400).json({'message': 'Create cart failed.'});
            await courseModel.findOne({_id: courseId, status: 'available'})
              .exec(async (error, course) => {
                if (error) return res.status(400).json({'message': 'Retrieve course failed.'});
                if (!course) return res.status(404).json({'message': 'Course not found.'});
                if (course.price == 0) return res.status(403).json({'message': 'Can not add a free course.'});
                let item = {
                  courseId: course._id,
                  coursePrice: course.price,
                  courseName: course.name
                }
                cart.addItem(item);
                await cart.save(error => {
                  if (error) return res.status(400).json({'message': 'Save item failed.'});
                  res.status(200).json({'message': 'Add item successfully.'});
                });
              });
          });
        } else {
          const foundItem = cart.items.find(item => item.courseId == courseId);
          if (foundItem) return res.status(409).json({'message': 'Course already exist in your cart.'});
          await courseModel.findOne({_id: courseId, status: 'available'})
            .exec(async (error, course) => {
              if (error) return res.status(400).json({'message': 'Retrieve course failed.'});
              if (!course) return res.status(404).json({'message': 'Course not found.'});
              if (course.price == 0) return res.status(403).json({'message': 'Can not add a free course.'});
              let item = {
                courseId: course._id,
                coursePrice: course.price,
                courseName: course.name
              }
              cart.addItem(item);
              if (cart.promotionCode) {
                const availablePromotion = await getAvailablePromotion(cart.promotionCode);
                if (availablePromotion) cart.addPromotion(availablePromotion);
                else cart.removePromotion();
              }
              await cart.save(error => {
                if (error) {
                  return res.status(400).json({'message': 'Save cart failed.'});
                }
                res.status(200).json({'message': 'Add item successfully.'});
              });
            });
        }
      });
  });
}

const cart_removeItem = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    const courseId = req.body.courseId;
    await cartModel.findOne({userId: user._id, isCurrent: true})
      .exec(async (error, cart) => {
        if (error) return res.status(400).json({'message': 'Retrieve cart failed.'});
        if (!cart) {
          await cartModel.create({
            userId: user._id
          }, async error => {
            if (error) return res.status(400).json({'message': 'Create cart failed.'});
            res.status(400).json({'message': 'Item not found in cart.'});
          });
        } else {
          await courseModel.findById(courseId)
            .exec(async (error, course) => {
              if (error) return res.status(400).json({'message': 'Retrieve course failed.'});
              if (!course) return res.status(404).json({'message': 'Course not found.'});
              cart.removeItem(course._id);
              if (cart.items.length == 0) cart.removePromotion();
              if (cart.promotionCode) {
                const promotion = await getAvailablePromotion(cart.promotionCode);
                if (promotion) cart.addPromotion(promotion);
                else cart.removePromotion();
              }
              await cart.save(error => {
                if (error) return res.status(400).json({'message': 'Save cart failed.'});
                res.status(200).json({'message': 'Remove item from cart successfully.'});
              });
            });
        }
      });
  });
}

const cart_finishPayment = (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    cartModel.findOne({userId: user._id, isPaid: false, isCurrent: true})
      .exec((error, cart) => {
        if (error) return res.status(400).json({'message': 'Find course failed.'});
        if (cart && cart.items.length > 0) {
          cart.isPaid = true;
          cart.paidDate = Date.now();
          cart.isCurrent = false;
          cart.paymentMethod = req.body.paymentMethod;
          for (let i = 0; i < cart.items.length; i++) {
            const item = cart.items[i];
            courseModel.findById(item.courseId)
              .select('tags purchasedCount totalCollect')
              .exec((error, course) => {
                if (error) return res.status(400).json({'message': 'Find course failed.'});
                if (course) {
                  course.purchasedCount++;
                  course.totalCollect = (course.totalCollect)? course.totalCollect : 0;
                  course.totalCollect += item.coursePrice;
                  userModel.findById(user._id)
                    .exec((error, tempUser) => {
                      if (error) return res.status(400).json({'message': 'Retrieve user failed.'});
                      if (!tempUser) return res.status(404).json({'message': 'User not found.'});
                      for (let i = 0; i < course.tags.length; i++) {
                        tempUser.tags.push(course.tags[i]);
                      }
                      tempUser.tags = [...new Set(tempUser.tags)];
                      tempUser.purchasedCourseIds.push(course._id);
                      tempUser.save(error => {
                        if (error) return res.status(400).json({'message': 'Save tempUser failed.'});
                        course.save(error => {
                          if (error) return res.status(400).json({'message': 'Save course failed.'});
                        });
                      });
                    });
                } else return res.status(404).json({'message': 'Course not found.'});
              });
          }
          userModel.findById(user._id)
            .exec((error, tempUser) => {
              if (error) return res.status(400).json({'message': 'Retrieve user failed.'});
              if (!tempUser) return res.status(404).json({'message': 'User not found.'});
              tempUser.totalSpend = (user.totalSpend)? user.totalSpend : 0;
              tempUser.totalSpend += cart.totalAfterPromoted;              
              tempUser.save(error => {
                if (error) return res.status(400).json({'message': 'Save tempUser2 failed.'});
                cart.save(error => {
                  if (error) return res.status(400).json({'message': 'Save cart failed.'});
                  cartModel.create({userId: user._id}, error => {
                    if (error) return res.status(400).json({'message': 'Create new cart failed.'});
                    res.status(201).json({'message': 'Successfully pay for cart.'});
                  });
                });
              })
            });
        } else return res.status(404).json({'message': 'No cart found.'});
      });
  });
}

const cart_finishPaymentV2 = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    const [paidCart, tempUser] = await Promise.all([
      cartModel.findOne({isPaid: false, userId: user._id, isCurrent: true}),
      userModel.findById(user._id)
    ]);
    if (!paidCart || !tempUser) return res.status(404).json({'message': 'Retrieve data failed'});
    paidCart.isPaid = true;
    paidCart.paidDate = Date.now();
    paidCart.isCurrent = false;
    paidCart.paymentMethod = (req.body.paymentMethod)? req.body.paymentMethod : "cash";
    for (let i = 0; i < paidCart.items.length; i++) {
      const item = paidCart.items[i];
      const [course] = await Promise.all([
        courseModel.findById(item.courseId)
      ]);
      if (!course) return res.status(404).json({'message': 'No course found.'});
      course.purchasedCount++;
      course.totalCollect = (course.totalCollect)? course.totalCollect : 0;
      course.totalCollect += item.coursePrice;      
      for (let i = 0; i < course.tags.length; i++) {
        const found = tempUser.tags.find(tag => tag == course.tags[i]);
        if (found) continue;
        tempUser.tags.push(course.tags[i]);
      }
      tempUser.purchasedCourseIds.push(course._id);
      await course.save(error => {
        if (error) return res.status(400).json({'message': 'Save course failed.'});
      });
    }
    if (paidCart.promotionCode) {
      const [thisPromotion] = await Promise.all([
        promotionModel.findOne({code: paidCart.promotionCode})
      ]);
      thisPromotion.usedCount++;
      if (thisPromotion.usedCount == thisPromotion.totalAmount) {
        thisPromotion.status = 'dropped';
      }
      await thisPromotion.save(error => {
        if (error) return res.status(400).json({'message': 'Save thisPromotion failed.'});
      });
    }
    tempUser.totalSpend = (tempUser.totalSpend)? tempUser.totalSpend : 0;
    tempUser.totalSpend += paidCart.totalAfterPromoted;
    await tempUser.save(async (error) => {
      if (error) return res.status(400).json({'message': 'Save user failed.'});
      await paidCart.save(async (error) => {
        if (error) return res.status(400).json({'message': 'Save cart failed.'});
        await cartModel.create({userId: user._id}, error => {
          if (error) return res.status(400).json({'message': 'Create new cart failed.'});
          res.status(201).json({'message': 'Cart payment successfully.'});
        });
      });
    });
  });
}

const cart_addPromotion = async (req, res) => {
  const promotionCode = req.body.promotionCode;
  if (!promotionCode) return res.status(400).json({'message': 'No promotionCode found.'});
  await promotionModel.findOne({code: promotionCode, status: 'available'})
    .exec(async (error, promotion) => {
      if (error) return res.status(500).json({'message': 'Retrieve promotion failed.'});
      if (!promotion) return res.status(404).json({'message': 'Promotion not found.'});
      await middleware.getUser(req, res, async (req, res, user) => {
        await cartModel.findOne({userId: user._id, isCurrent: true})
          .exec(async (error, cart) => {
            if (error) return res.status(400).json({'message': 'Retrieve cart failed.'});
            if (!cart) {
              await cartModel.create({userId: user._id}, error => {
                if (error) return res.status(400).json({'message': 'Create cart failed.'});
                res.status(400).json({'message': 'Can not add promotion to an empty cart.'});
              });
            } else if (cart.items && cart.items.length > 0) {
              if (cart.promotionCode) {
                const promotion = await getAvailablePromotion(cart.promotionCode);
                if (promotion) return res.status(409).json({'message': 'Promotion already exist.'});
                cart.removePromotion();
                const newPromotion = await getAvailablePromotion(promotionCode);
                if (newPromotion) {
                  cart.addPromotion(newPromotion);
                  await cart.save(error => {
                    if (error) return res.status(400).json({'message': 'Save cart failed.'});
                    res.status(200).json({'message': 'Add promotion successfully.'});
                  });
                } else {
                  await cartModel.save(error => {
                    if (error) return res.status(400).json({'message': 'Save cart failed.'});
                    res.status(404).json({'message': 'Promotion not found.'});
                  });
                }
              } else {
                const promotion = await getAvailablePromotion(promotionCode);
                if (promotion) {
                  cart.addPromotion(promotion);
                  await cart.save(error => {
                    if (error) return res.status(400).json({'message': 'Save cart failed'});
                    res.status(200).json({'message': 'Add promotion successfully.'});
                  });
                }
              }
            } else {
              res.status(400).json({'message': 'Can not add promotion to an empty cart.'});
            }
          });
      });
    });
}

const cart_addPromotionV2 = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    const [currentCart, validPromotion] = await Promise.all([
      cartModel.findOne({userId: user._id, isCurrent: true}),
      promotionModel.findOne({code: req.body.promotionCode, status: 'available'})
    ]);
    if (!validPromotion) return res.status(404).json({'message': 'No valid promotion found.'});
    if (!currentCart) {
      await cartModel.create({userId: user._id}, err => {
        if (err) return res.status(400).json({'message': 'Create new cart failed.'});
        res.status(403).json({'message': 'Can not add promotion to an empty cart.'});
      });
    } else {
      currentCart.addPromotion(validPromotion);
      await currentCart.save(error => {
        if (error) return res.status(400).json({'message': 'Save currentCart failed.'});
        res.status(201).json({'message': 'Promotion added successfully.'});
      });
    }
  });
}

const cart_removePromotion = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    await cartModel.findOne({userId: user._id, isCurrent: true})
      .exec(async (error, cart) => {
        if (error) return res.status(400).json({'message': 'Retrieve cart failed.'});
        if (!cart) {
          await cartModel.create({userId: user._id}, error => {
            if (error) return res.status(400).json({'message': 'Create new cart failed.'});
            res.status(400).json({'message': 'No promotion on an empty cart.'});
          });
        } else {
          if (!cart.promotionCode) return res.status(404).json({'message': 'Promotion not found in your cart.'});
          cart.removePromotion();
          await cart.save(error => {
            if (error) return res.status(400).json({'message': 'Save cart failed.'});
            res.status(200).json({'message': 'Remove promotion successfully.'});
          });
        }
      });
  });
}

const cart_removePromotionV2 = (req, res) => {
  middleware.getUser(req, res, async (req, res, user) => {
    const [currentCart] = await Promise.all([
      cartModel.findOne({userId: user._id, isCurrent: true})
    ]);
    if (!currentCart) {
      await cartModel.create({userId: user._id}, error => {
        if (error) return res.status(400).json({'message': 'Create new cart failed.'});
        res.status(404).json({'message': 'Promotion not exist in cart.'});
      });
    } else {
      if (currentCart.promotionCode) {
        currentCart.removePromotion();
        await currentCart.save(error => {
          if (error) return res.status(400).json({'message': 'Save currentCart failed.'});
          res.status(200).json({'message': 'Remove promotion successfully.'});
        });
      } else {
        return res.status(403).json({'message': 'No promotion found in your cart.'});
      }
    }
  });
}

module.exports = {
  cart_dropCurrent,
  cart_addItem,
  cart_removeItem,
  cart_getCurrent,
  cart_finishPayment,
  cart_addPromotion,
  cart_removePromotion,
  admin_getAllPaidCarts,
  cart_finishPaymentV2,
  cart_addPromotionV2,
  cart_removePromotionV2
}