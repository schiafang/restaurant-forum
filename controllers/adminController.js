const db = require('../models')
const Restaurant = db.Restaurant

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
    if (!req.body.name) {
      req.flash('errorMsg', "name didn't exist")
      return res.redirect('back')
    }
    return Restaurant.create({ name, tel, address, opening_hours, description })
      .then(restaurant => {
        req.flash('successMsg', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
  }
}
module.exports = adminController