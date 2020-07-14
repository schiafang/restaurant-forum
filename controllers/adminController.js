const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Comment = db.Comment
// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

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
  //瀏覽新增頁面
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories })
      })
  },
  //瀏覽編輯餐廳頁面
  editRestaurant: (req, res) => {
    const id = req.params.id
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(id, { raw: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant, categories })
          })
      })
  },
  //顯示使用者清單
  getUsers: (req, res) => {
    return User.findAll({ raw: true }).then(users => {
      return res.render('admin/users', { users })
    })
  },
  //修改使用者
  putUser: (req, res) => {
    const id = req.params.id
    console.log(id)
    return User.findByPk(id)
      .then(user => {
        if (user.isAdmin) { return user.update({ isAdmin: false }) }
        return user.update({ isAdmin: true })
      })
      .then(() => {
        req.flash('successMsg', '成功變更使用者身份')
        res.redirect('/admin/users')
      })
  }
}

module.exports = adminController