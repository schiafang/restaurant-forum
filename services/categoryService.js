const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    const id = req.params.id
    return Category.findAll({ raw: true, nest: true }).then(categories => {
      if (id) {
        Category.findByPk(id, { raw: true, nest: true })
          .then(category => res.render('admin/categories', { categories, category }))
      } else {
        callback({ categories })
      }
    })
  }
}

module.exports = categoryService