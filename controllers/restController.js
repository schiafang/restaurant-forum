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
            categoryName: restaurant.Category.name,
            isFavorited: req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id),
            isLike: req.user.RestaurantsLike.map(item => item.id).includes(restaurant.id)
          }))
        const restaurants = JSON.parse(JSON.stringify(data))

        Category.findAll({ raw: true, nest: true }).then(categories => {
          return res.render('restaurants', { categories, categoryId, restaurants, page, totalPage, prev, next })
        })
      })
  },
  getRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikeByUsers' },
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(item => item.id).includes(req.user.id)
        const isLike = restaurant.LikeByUsers.map(item => item.id).includes(req.user.id)
        const likeCount = restaurant.LikeByUsers.map(item => item.id).length
        restaurant.increment('viewCounts')
          .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLike, likeCount }))
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
      return Restaurant.findByPk(id, { include: [Category, { model: User, as: 'FavoritedUsers' },] })
        .then(restaurant => {
          let favoritedUsersCount = restaurant.FavoritedUsers.length
          res.render('dashboard', { restaurant: restaurant.toJSON(), commentsCount, favoritedUsersCount })
        })
    })
  },
  getTopRestaurants: (req, res) => {
    return Restaurant.findAll({ include: { model: User, as: 'FavoritedUsers' } })
      .then(restaurants => {
        restaurants = restaurants.sort((a, b) => b.FavoritedUsers.length - a.FavoritedUsers.length).slice(0, 10)
        restaurants = JSON.parse(JSON.stringify(restaurants)).map((restaurant, i) => ({
          ...restaurant,
          description: restaurant.description.substring(0, 50),
          isFavorited: req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id),
          favoritedUsersCount: restaurant.FavoritedUsers.length,
          rank: i + 1
        }))
        res.render('topRestaurants', { restaurants })
      })
  }
}
module.exports = restController