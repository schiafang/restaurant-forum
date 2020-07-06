const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    const id = req.params.id
    return Category.findAll({ raw: true, nest: true }).then(categories => {
      if (id) {
        Category.findByPk(id, { raw: true, nest: true })
          .then(category => res.render('admin/categories', { categories, category }))
      } else res.render('admin/categories', { categories })
    })
  },
  postCategory: (req, res) => {
    const name = req.body.name
    if (!name) res.redirect('back')
    else Category.create({ name }).then(() => res.redirect('/admin/categories'))
  },
  putCategory: (req, res) => {
    const id = req.params.id
    const name = req.body.name
    if (!name) res.redirect('back')
    return Category.findByPk(id)
      .then(category => category.update({ name }))
      .then(() => res.redirect('/admin/categories'))
  },
  deleteCategory: (req, res) => {
    const id = req.params.id
    return Category.findByPk(id)
      .then(category => category.destroy())
      .then(() => res.redirect('/admin/categories'))
  }
}

module.exports = categoryController