const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

let userController = {
  signUpPage: (req, res) => res.render('signup'),
  signInPage: (req, res) => res.render('signin'),
  signUp: (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    if (req.body.confirmPassword !== req.body.password) {
      req.flash('errorMsg', '兩次密碼輸入不同！')
      return res.render('signup', { name, email, password })
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('errorMsg', '信箱重複！')
          return res.render('signup', { name, email, password })
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('successMsg', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  }
}
module.exports = userController