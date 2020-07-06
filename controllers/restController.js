const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category }).then(restaurants => {
      const data = restaurants.map(restaurant =>
        ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description.substring(0, 50),
          categoryName: restaurant.Category.name
        })
      )
      return res.render('restaurants', { restaurants: JSON.parse(JSON.stringify(data)) })
    })
  },
  getRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { raw: true, nest: true, include: Category })
      .then(restaurant => res.render('restaurant', { restaurant }))
  }
}
module.exports = restController
