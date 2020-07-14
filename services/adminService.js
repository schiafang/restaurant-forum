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
  },
  postRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    const { file } = req

    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    if (file) {
      // 本地將圖片儲存至 upload 資料夾
      // fs.readFile(file.path, (err, data) => {
      //   if (err) console.log('Error: ', err)
      //   fs.writeFile(`upload/${file.originalname}`, data, () => {
      //     return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? `/upload/${file.originalname}` : null })
      //       .then(() => callback({ status: 'success', message: "restaurant was successfully created")
      //   })
      // })
      // 將圖片轉存至 imgur
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        image = file ? img.data.link : null
        return Restaurant.create({ name, tel, address, opening_hours, description, image, CategoryId })
          .then(() => callback({ status: 'success', message: "restaurant was successfully created" })
          )
      })
    } else {
      image = 'https://i.imgur.com/HT8zCpm.png'
      return Restaurant.create({ name, tel, address, opening_hours, description, CategoryId, image })
        .then(() => callback({ status: 'success', message: "restaurant was successfully created" }))
    }
  },
  putRestaurant: (req, res, callback) => {
    const id = req.params.id
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    const { file } = req

    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }

    if (file) {
      // fs.readFile(file.path, (err, data) => {
      //   if (err) console.log('Error: ', err)
      //   fs.writeFile(`upload/${file.originalname}`, data, () => {
      //     return Restaurant.findByPk(id)
      //       .then(restaurant => {
      //         return restaurant.update({ name, tel, address, opening_hours, description, image: file ? img.data.link : null })
      //       })
      //       .then(() => callback({ status: 'success', message: "restaurant was updated" })
      //   })
      // })
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        image = file ? img.data.link : null
        return Restaurant.findByPk(id)
          .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description, CategoryId, image }))
          .then(() => callback({ status: 'success', message: "restaurant was updated" }))
      })
    } else {
      return Restaurant.findByPk(id)
        .then(restaurant => restaurant.update({ name, tel, address, opening_hours, description, CategoryId }))
        .then(() => callback({ status: 'success', message: "restaurant was updated" }))
        .catch(error => console.log('error'))
    }
  }
}

module.exports = adminService