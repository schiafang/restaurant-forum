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
  },
  postCategory: (req, res, callback) => {
    const name = req.body.name
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    Category.create({ name })
      .then(() => {
        return callback({ status: 'success', message: "success create category" })
      })
  },
  putCategory: (req, res, callback) => {
    const id = req.params.id
    const name = req.body.name
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    Category.findByPk(id)
      .then(category => category.update({ name }))
      .then(() => {
        callback({ status: 'success', message: "success update category" })
      })
  },
  deleteCategory: (req, res, callback) => {
    const id = req.params.id
    return Category.findByPk(id)
      .then(category => category.destroy())
      .then(() => callback({ status: 'success', message: 'success delete category' }))
  }
}

module.exports = categoryService