const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Comment = db.Comment
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants })
    })
  },
  getRestaurant: (req, res, callback) => {
    const id = req.params.id
    Restaurant.findByPk(id, { raw: true, nest: true, include: [Category] }).then(restaurant => {
      callback({ restaurant })
    })
  },
  deleteRestaurant: (req, res, callback) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { include: [Comment] })
      .then(restaurant => {
        if (restaurant.Comments.length !== 0) { restaurant.Comments[0].destroy() }
        restaurant.destroy()
      })
      .then(() => callback({ status: 'success', message: '' }))
  }
}

module.exports = adminService