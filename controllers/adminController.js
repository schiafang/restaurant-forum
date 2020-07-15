const adminService = require('../services/adminService')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => res.render('admin/restaurants', data))
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => res.render('admin/restaurant', data))
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      res.redirect('/admin/restaurants')
    })
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('errorMsg', data['message'])
        return res.redirect('back')
      } else {
        req.flash('successMsg', data['message'])
        res.redirect('/admin/restaurants')
      }
    })
  },
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('errorMsg', data['message'])
        return res.redirect('back')
      } else {
        req.flash('successMsg', data['message'])
        res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: (req, res) => {
    adminService.getUsers(req, res, data => res.render('admin/users', data))
  },
  putUser: (req, res) => {
    adminService.putUser(req, res, data => {
      req.flash('successMsg', data['message'])
      res.redirect('/admin/users')
    })
  },
  //no API need
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => res.render('admin/create', { categories }))
  },
  editRestaurant: (req, res) => {
    const id = req.params.id
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(id, { raw: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant, categories })
          })
      })
  }
}

module.exports = adminController