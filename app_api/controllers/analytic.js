const mongoose = require('mongoose');
const cartModel = mongoose.model('Cart');
const courseModel = mongoose.model('Course');
const middleware = require('../middleware/middleware');

const getRevenueOfYear = async (req, res) => {
  middleware.getUser(req, res, (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    cartModel.find({isPaid: true})
      .exec((error, carts) => {
        if (error) return res.status(400).json({'message': 'Retrieve carts failed.'});
        if (carts && carts.length > 0) {
          const year = parseInt(req.body.year);
          carts = carts.filter((cart) => {
            return cart.paidDate.getFullYear() == year;
          });
          let revenues = [
            {
              name: 'Jan',
              value: 0,
            },
            {
              name: 'Feb',
              value: 0,
            },
            {
              name: 'Mar',
              value: 0,
            },
            {
              name: 'Apr',
              value: 0,
            },
            {
              name: 'May',
              value: 0,
            },
            {
              name: 'Jun',
              value: 0,
            },
            {
              name: 'Jul',
              value: 0,
            },
            {
              name: 'Aug',
              value: 0,
            },
            {
              name: 'Sep',
              value: 0,
            },
            {
              name: 'Oct',
              value: 0,
            },
            {
              name: 'Nov',
              value: 0,
            },
            {
              name: 'Dec',
              value: 0,
            }
          ];
          let totalYear = 0;
          for (let index = 0; index < carts.length; index++) {
            let month = carts[index].paidDate.getMonth();
            revenues[month].value += carts[index].totalAfterPromoted;
            totalYear += carts[index].totalAfterPromoted;
          }
          res.status(200).json({revenues, totalYear});
        } else res.status(404).json({'message': 'No carts found.'});
      });
  });
}

const getRevenueOfYearV2 = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    const [carts] = await Promise.all([
      cartModel.find({isPaid: true, isCurrent: false})
    ]);
    if (!carts || carts.length == 0) return res.status(404).json({'message': 'No carts found.'});
    const year = req.params.year;
    if (year) {

      await getRevenueOfYear(req, res);
    }
  });
}

const getAllTags = async () => {
  let result = [];
  const [courses] = await Promise.all([
    courseModel.find()
  ])
  if (!courses) return null;
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
    const course = courses[courseIndex];
    for (let tagIndex = 0; tagIndex < course.tags.length; tagIndex++) {
      const tag = course.tags[tagIndex];
      const found = result.find(element => element.name == tag);
      if (found) {
        found.count++;
      } else {
        result.push({name: tag, count: 1});
      }
    }
  }
  return result;
}

const getTrendTagsData = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    let topTenTags = await getAllTags();
    for (let index = 0; index < topTenTags.length; index++) {
      let element = topTenTags[index];
      element.series = [
        {
          name: 'Jan',
          value: 0,
        },
        {
          name: 'Feb',
          value: 0,
        },
        {
          name: 'Mar',
          value: 0,
        },
        {
          name: 'Apr',
          value: 0,
        },
        {
          name: 'May',
          value: 0,
        },
        {
          name: 'Jun',
          value: 0,
        },
        {
          name: 'Jul',
          value: 0,
        },
        {
          name: 'Aug',
          value: 0,
        },
        {
          name: 'Sep',
          value: 0,
        },
        {
          name: 'Oct',
          value: 0,
        },
        {
          name: 'Nov',
          value: 0,
        },
        {
          name: 'Dec',
          value: 0,
        }
      ]
    }
    const year = parseInt(req.body.year);
    if (!year) return res.status(400).json({'message': 'Year is required.'});
    let [carts] = await Promise.all([
      cartModel.find({isPaid: true})
    ]);
    if (carts.length == 0 || !carts) return res.status(404).json({'message': 'No carts found.'});
    carts = carts.filter(cart => cart.paidDate.getFullYear() == year);
    for (let cartIndex = 0; cartIndex < carts.length; cartIndex++) {
      const cart = carts[cartIndex];
      for (let itemIndex = 0; itemIndex < cart.items.length; itemIndex++) {
        const item = cart.items[itemIndex];
        const [course] = await Promise.all([
          courseModel.findById(item.courseId)
        ]);
        if (!course) return res.status(404).json({'message': 'Course not found.'});
        for (let tagIndex = 0; tagIndex < course.tags.length; tagIndex++) {
          const tag = course.tags[tagIndex];
          const found = topTenTags.find(element => element.name == tag);
          if (found) {
            found.series[cart.paidDate.getMonth()].value++;
          }
        }
      }
    }
    topTenTags = topTenTags.sort((a, b) => b.count - a.count);
    res.status(200).send(topTenTags.slice(0, 10));
  });
}

module.exports = {
  getRevenueOfYear,
  getTrendTagsData
}