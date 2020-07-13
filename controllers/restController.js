const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite

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
        { model: User, as: 'LikeByUsers' },
        { model: Comment, include: User }
      ]
    })
      .then(restaurant => restaurant.increment('viewCounts'))
      .then(restaurant => {
        const isFavorited = req.user.FavoritedRestaurants.map(item => item.id).includes(Number(id))
        const isLike = req.user.RestaurantsLike.map(item => item.id).includes(Number(id))
        const likeCount = restaurant.LikeByUsers.map(item => item.id).length
        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLike, likeCount })
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

    Restaurant.findByPk(id, { include: [Category, Comment, { model: User, as: 'FavoritedUsers' },] })
      .then(restaurant => {
        restaurant = restaurant.toJSON()
        const countComments = restaurant.Comments.length
        const countFavoritedUsers = restaurant.FavoritedUsers.length

        return res.render('dashboard', { restaurant, countComments, countFavoritedUsers })
      })
  },
  getTopRestaurants: (req, res) => {
    // 1.撈出所有餐廳直接排序
    // return Restaurant.findAll({ include: { model: User, as: 'FavoritedUsers' } })
    //   .then(restaurants => {
    //     restaurants = restaurants.sort((a, b) => b.FavoritedUsers.length - a.FavoritedUsers.length).slice(0, 10)
    //     restaurants = JSON.parse(JSON.stringify(restaurants)).map((restaurant, i) => ({
    //       ...restaurant,
    //       description: restaurant.description.substring(0, 50),
    //       isFavorited: req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id),
    //       favoritedUsersCount: restaurant.FavoritedUsers.length,
    //       rank: i + 1
    //     }))
    //     res.render('topRestaurants', { restaurants })
    //   })

    // 2.先在 Favorite 資料表過濾排序餐廳
    const Sequelize = require('sequelize')
    return Favorite.findAll({
      raw: true,
      group: 'RestaurantId',
      attributes: [
        'RestaurantId',
        // [Sequelize.fn('COUNT', 'RestaurantId'), 'FavoriteCount'],
      ],
      order: [
        // [Sequelize.literal('FavoriteCount'), 'DESC']
        [Sequelize.fn('COUNT', 'RestaurantId'), 'DESC']
      ],
      limit: 10
    })
      .then(results => {
        const id = results.map(item => item.RestaurantId)
        return Restaurant.findAll({
          where: { id },
          include: { model: User, as: 'FavoritedUsers' }
        })
      })
      .then(restaurants => {
        restaurants = JSON.parse(JSON.stringify(restaurants)).map((restaurant, i) => ({
          ...restaurant,
          isFavorited: req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id),
          favoritedUsersCount: restaurant.FavoritedUsers.length,
          rank: i + 1
        }))
        res.render('topRestaurants', { restaurants })
      })
  }
}
module.exports = restController
