const restService = require('../services/restService')

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => res.render('restaurants', data))
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => res.render('restaurant', data))
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => res.render('feeds', data))
  },
  getDashboard: (req, res) => {
    restService.getDashboard(req, res, data => res.render('dashboard', data))
  },
  getTopRestaurants: (req, res) => {
    restService.getTopRestaurants(req, res, data => res.render('topRestaurants', data))
  }
}
module.exports = restController
