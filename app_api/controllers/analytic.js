const mongoose = require('mongoose');
const cartModel = mongoose.model('Cart');
const courseModel = mongoose.model('Course');
const middleware = require('../middleware/middleware');

const getRevenueOfYear = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    let [carts] = await Promise.all([
      cartModel.find({isPaid: true})
    ]);
    if (carts && carts.length > 0) {
      const year = parseInt(req.body.year);
      if (!year) return res.status(400).json({'message': 'Year is required.'});
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
      for (let cartIndex = 0; cartIndex < carts.length; cartIndex++) {
        let month = carts[cartIndex].paidDate.getMonth();
        revenues[month].value += carts[cartIndex].totalAfterPromoted;
        totalYear += carts[cartIndex].totalAfterPromoted;
      }
      res.status(200).json({revenues, totalYear});
    } else res.status(404).json({'message': 'No carts found.'});
  });
}

const getRevenueAYearBeforeToday = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    const [carts] = await Promise.all([
      cartModel.find({isPaid: true})
    ]);
    if (carts && carts.length > 0) {
      const today = new Date();
      const month = today.getMonth();
      let lastYearCarts = carts.filter(cart => cart.paidDate.getFullYear() == today.getFullYear() - 1);
      let thisYearCarts = carts.filter(cart => cart.paidDate.getFullYear() == today.getFullYear());
      lastYearCarts = lastYearCarts.sort((a, b) => a.paidDate.getMonth() - b.paidDate.getMonth());
      thisYearCarts = thisYearCarts.sort((a, b) => a.paidDate.getMonth() - b.paidDate.getMonth());
      lastYearCarts = lastYearCarts.filter((a, b) => a.paidDate.getMonth() > today.getMonth());
      thisYearCarts = thisYearCarts.filter((a, b) => a.paidDate.getMonth() <= today.getMonth());
      
      let revenues = [];

      for (let monthIndex = month + 1; monthIndex < 12; monthIndex++) {
        const carts = lastYearCarts.filter(cart => cart.paidDate.getMonth() == monthIndex);
        if (carts.length == 0) revenues.push({name: monthIndex, value: 0});
        else revenues.push({name: monthIndex, value: carts.reduce((acc, curr) => acc + curr.totalAfterPromoted, 0)});
      }

      for (let monthIndex = 0; monthIndex < month + 1; monthIndex++) {
        const carts = thisYearCarts.filter(cart => cart.paidDate.getMonth() == monthIndex);
        if (carts.length == 0) revenues.push({name: monthIndex, value: 0});
        else revenues.push({name: monthIndex, value: carts.reduce((acc, curr) => acc + curr.totalAfterPromoted, 0)});
      }

      // for (let cartIndex = 0; cartIndex < lastYearCarts.length; cartIndex++) {
      //   const cart = lastYearCarts[cartIndex];
      //   const month = cart.paidDate.getMonth();
      //   const foundMonth = revenues.find(c => c.name == month);
      //   if (foundMonth) foundMonth.value += cart.totalAfterPromoted;
      //   else revenues.push({name: month, value: cart.totalAfterPromoted});
      // }

      // for (let cartIndex = 0; cartIndex < thisYearCarts.length; cartIndex++) {
      //   const cart = thisYearCarts[cartIndex];
      //   const month = cart.paidDate.getMonth();
      //   const foundMonth = revenues.find(c => c.name == month);
      //   if (foundMonth) foundMonth.value += cart.totalAfterPromoted;
      //   else revenues.push({name: month, value: cart.totalAfterPromoted});
      // }

      const months = [ "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December" ];

      for (let index = 0; index < revenues.length; index++) {
        revenues[index].name = months[revenues[index].name];
      }

      res.status(200).json({revenues});
    } else res.status(404).json({'message': 'No carts found.'});
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
      if (found) found.count++;
      else result.push({name: tag, count: 1});
    }
  }
  return result;
}

const getAllTagsV2 = async () => {
  let result = [];
  const [carts] = await Promise.all([
    cartModel.find()
  ])
  if (!carts) return null;
  for (let cartIndex = 0; cartIndex < carts.length; cartIndex++) {
    const cart = carts[cartIndex];
    for (let itemIndex = 0; itemIndex < cart.items.length; itemIndex++) {
      const item = cart.items[itemIndex];
      const [course] = await Promise.all([
        courseModel.findById(item.courseId)
      ]);
      if (!course) continue;
      for (let tagIndex = 0; tagIndex < course.tags.length; tagIndex++) {
        const tag = course.tags[tagIndex];
        const foundTag = result.find(t => t.name == tag);
        if (foundTag) foundTag.count++;
        else result.push({name: tag, count: 1});
      }
    }    
  }
  return result;
}

const getTrendTagsDataV2 = async (req, res) => {
  await middleware.getUser(req, res, async (req, res, user) => {
    if (!user.isAdmin) return res.status(403).json({'message': 'Admin privilege is required.'});
    const allTags = await getAllTagsV2();
    const topTenTags = allTags.sort((a, b) => b.count - a.count).slice(0, 10);
    topTenTags.forEach((tag) => tag.series = []);
    const [carts] = await Promise.all([
      cartModel.find({isPaid: true})
    ]);
    if (!carts || carts.length == 0) return res.status(404).json({'message': 'No carts found.'});
    else {
      const today = new Date();
      const month = today.getMonth();
      let lastYearCarts = carts.filter(cart => cart.paidDate.getFullYear() == today.getFullYear() - 1);
      let thisYearCarts = carts.filter(cart => cart.paidDate.getFullYear() == today.getFullYear());
      lastYearCarts = lastYearCarts.sort((a, b) => a.paidDate.getMonth() - b.paidDate.getMonth());
      thisYearCarts = thisYearCarts.sort((a, b) => a.paidDate.getMonth() - b.paidDate.getMonth());
      lastYearCarts = lastYearCarts.filter((a, b) => a.paidDate.getMonth() > today.getMonth());
      thisYearCarts = thisYearCarts.filter((a, b) => a.paidDate.getMonth() <= today.getMonth());
      
      const months = [ "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December" ];

      for (let cartIndex = 0; cartIndex < lastYearCarts.length; cartIndex++) {
        const cart = lastYearCarts[cartIndex];
        for (let itemIndex = 0; itemIndex < cart.items.length; itemIndex++) {
          const item = cart.items[itemIndex];
          const [course] = await Promise.all([
            courseModel.findById(item.courseId)
          ]);
          if (!course) continue;
          for (let tagIndex = 0; tagIndex < course.tags.length; tagIndex++) {
            const tag = course.tags[tagIndex];
            const foundTag = topTenTags.find(t => t.name == tag);
            if (foundTag) {
              const foundSeries = foundTag.series.find(s => s.name == months[cart.paidDate.getMonth()]);
              if (!foundSeries) foundTag.series.push({ name: months[cart.paidDate.getMonth()], value: 1});
              else foundSeries.value++;
            }
          }
        }

        for (let tagIndex = 0; tagIndex < topTenTags.length; tagIndex++) {
          const tag = topTenTags[tagIndex];
          const foundSeries = tag.series.find(s => s.name == months[cart.paidDate.getMonth()]);
          if (!foundSeries) tag.series.push({ name: months[cart.paidDate.getMonth()], value: 0});
        }
      }

      for (let cartIndex = 0; cartIndex < thisYearCarts.length; cartIndex++) {
        const cart = thisYearCarts[cartIndex];
        for (let itemIndex = 0; itemIndex < cart.items.length; itemIndex++) {
          const item = cart.items[itemIndex];
          const [course] = await Promise.all([
            courseModel.findById(item.courseId)
          ]);
          if (!course) continue;
          for (let tagIndex = 0; tagIndex < course.tags.length; tagIndex++) {
            const tag = course.tags[tagIndex];
            const foundTag = topTenTags.find(t => t.name == tag);
            if (foundTag) {
              const foundSeries = foundTag.series.find(s => s.name == months[cart.paidDate.getMonth()]);
              if (!foundSeries) foundTag.series.push({ name: months[cart.paidDate.getMonth()], value: 1});
              else foundSeries.value++;
            }
          }
        }

        for (let tagIndex = 0; tagIndex < topTenTags.length; tagIndex++) {
          const tag = topTenTags[tagIndex];
          const foundSeries = tag.series.find(s => s.name == months[cart.paidDate.getMonth()]);
          if (!foundSeries) tag.series.push({ name: months[cart.paidDate.getMonth()], value: 0});
        }
      }

      

      res.status(200).json(topTenTags);
    }
  });
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
  getTrendTagsData,
  getRevenueAYearBeforeToday,
  getTrendTagsDataV2
}