const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true }).then(categories => {
      return res.render('admin/categories', { categories })
    })
  },
  postCategory: (req, res) => {
    const name = req.body.name
    if (!name) res.redirect('back')
    else Category.create({ name }).then(() => res.redirect('/admin/categories'))
  }
}

module.exports = categoryController