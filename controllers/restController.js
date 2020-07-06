const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    let query = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      query['categoryId'] = categoryId //query: { categoryId: 123 }
    }
    Restaurant.findAll({ include: Category, where: query }).then(restaurants => {
      const data = restaurants.map(restaurant =>
        ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description.substring(0, 50),
          categoryName: restaurant.Category.name
        })
      )
      Category.findAll({ raw: true, nest: true }).then(categories => {
        return res.render('restaurants', { categories, categoryId, restaurants: JSON.parse(JSON.stringify(data)) })
      })
    })
  },
  getRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { raw: true, nest: true, include: Category })
      .then(restaurant => res.render('restaurant', { restaurant }))
  }
}
module.exports = restController