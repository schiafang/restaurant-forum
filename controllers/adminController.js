const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  //瀏覽全部餐廳
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants })
    })
  },
  //瀏覽指定餐廳
  getRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { raw: true }).then(restaurant => {
      return res.render('admin/restaurant', { restaurant })
    })
  },
  //瀏覽新增頁面
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  //新增餐廳資料
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
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
        return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? img.data.link : null })
          .then(() => res.redirect('/admin/restaurants'))
      })
    } else {
      return Restaurant.create({ name, tel, address, opening_hours, description })
        .then(() => res.redirect('/admin/restaurants'))
    }
  },
  //瀏覽編輯餐廳頁面
  editRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id, { raw: true })
      .then(restaurant => res.render('admin/create', { restaurant }))
  },
  //編輯資料庫餐廳資料
  putRestaurant: (req, res) => {
    const id = req.params.id
    const { name, tel, address, opening_hours, description } = req.body
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
        return Restaurant.findByPk(id)
          .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description, image: file ? img.data.link : null }))
          .then(() => res.redirect('/admin/restaurants'))
      })
    } else {
      return Restaurant.findByPk(id)
        .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description }))
        .then(() => res.redirect('/admin/restaurants'))
        .catch(error => console.log('error'))
    }
  },
  //刪除餐廳資料
  deleteRestaurant: (req, res) => {
    const id = req.params.id
    return Restaurant.findByPk(id)
      .then(restaurant => restaurant.destroy())
      .then(() => res.redirect('/admin/restaurants'))
      .catch(error => console.log('error'))
  }
}

module.exports = adminController