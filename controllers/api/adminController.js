const adminService = require('../../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => res.json(data))
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => res.json(data))
  },
}

module.exports = adminController