const db = require('../models')
const Category = db.Category

const categoryService = require('../services/categoryService')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => res.render('admin/categories', data))
  },
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      if (data['status'] === 'error') {
        return res.redirect('back')
      }
      req.flash('successMsg', data['message'])
      res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      if (data['status'] === 'error') {
        return res.redirect('back')
      }
      req.flash('successMsg', data['message'])
      res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res) => {
    const id = req.params.id
    return Category.findByPk(id)
      .then(category => category.destroy())
      .then(() => res.redirect('/admin/categories'))
  }
}

module.exports = categoryController