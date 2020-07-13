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

  //瀏覽新增頁面
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories })
      })
  },
  //新增餐廳資料
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    const { file } = req

    if (!req.body.name) {
      req.flash('errorMsg', "name didn't exist")
      return res.redirect('back')
    }

    if (file) {
      // 本地將圖片儲存至 upload 資料夾
      // fs.readFile(file.path, (err, data) => {
      //   if (err) console.log('Error: ', err)
      //   fs.writeFile(`upload/${file.originalname}`, data, () => {
      //     return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? `/upload/${file.originalname}` : null })
      //       .then(() => res.redirect('/admin/restaurants'))
      //   })
      // })
      // 將圖片轉存至 imgur
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        image = file ? img.data.link : null
        return Restaurant.create({ name, tel, address, opening_hours, description, image, CategoryId })
          .then(() => res.redirect('/admin/restaurants'))
      })
    } else {
      image = 'https://i.imgur.com/HT8zCpm.png'
      return Restaurant.create({ name, tel, address, opening_hours, description, CategoryId, image })
        .then(() => res.redirect('/admin/restaurants'))
    }
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
  //編輯資料庫餐廳資料
  putRestaurant: (req, res) => {
    const id = req.params.id
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    const { file } = req

    if (!req.body.name) {
      req.flash('errorMsg', "name didn't exist")
      return res.redirect('back')
    }

    if (file) {
      // fs.readFile(file.path, (err, data) => {
      //   if (err) console.log('Error: ', err)
      //   fs.writeFile(`upload/${file.originalname}`, data, () => {
      //     return Restaurant.findByPk(id)
      //       .then(restaurant => {
      //         return restaurant.update({ name, tel, address, opening_hours, description, image: file ? img.data.link : null })
      //       })
      //       .then(() => res.redirect('/admin/restaurants'))
      //   })
      // })
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        image = file ? img.data.link : null
        return Restaurant.findByPk(id)
          .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description, CategoryId, image }))
          .then(() => res.redirect('/admin/restaurants'))
      })
    } else {
      return Restaurant.findByPk(id)
        .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description, CategoryId }))
        .then(() => res.redirect('/admin/restaurants'))
        .catch(error => console.log('error'))
    }
  },
  //刪除餐廳資料
  deleteRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { include: [Comment] })
      .then(restaurant => {
        if (restaurant.Comments.length !== 0) { restaurant.Comments[0].destroy() }
        restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(error => console.log('error'))
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