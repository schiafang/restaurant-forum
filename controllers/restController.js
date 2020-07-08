const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    const categoryId = Number(req.query.categoryId)
    const queryPage = Number(req.query.page)
    let offset = queryPage ? (queryPage - 1) * pageLimit : 0
    let selectCategory = categoryId ? { 'categoryId': categoryId } : {}

    Restaurant.findAndCountAll({ include: Category, where: selectCategory, offset, limit: pageLimit })
      .then(result => {
        let page = queryPage || 1
        let pages = Math.ceil(result.count / pageLimit)
        let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        let prev = page - 1 < 1 ? 1 : page - 1
        let next = page + 1 > pages ? pages : page + 1

        const data = result.rows.map(restaurant =>
          ({
            ...restaurant.dataValues,
            description: restaurant.dataValues.description.substring(0, 50),
            categoryName: restaurant.Category.name
          }))
        const restaurants = JSON.parse(JSON.stringify(data))

        Category.findAll({ raw: true, nest: true }).then(categories => {
          return res.render('restaurants', { categories, categoryId, restaurants, page, totalPage, prev, next })
        })
      })
  },
  getRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { include: [Category, { model: Comment, include: [User] }] })
      .then(restaurant => {
        restaurant.increment('viewCounts')
          .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON() }))
      })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', { restaurants, comments })
      })
    })
  },
  getDashboard: (req, res) => {
    const id = req.params.id
    Comment.findAndCountAll({ where: { RestaurantId: id } }).then(result => {
      let commentsCount = result.count
      return Restaurant.findByPk(id, { include: [Category] }).then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON(), commentsCount })
      })
    })
  }
}
module.exports = restController