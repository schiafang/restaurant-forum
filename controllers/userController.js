const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => res.render('signup'),
  signInPage: (req, res) => res.render('signin'),
  signUp: (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    if (password !== confirmPassword) {
      req.flash('errorMsg', '密碼與確認密碼必須相同')
      return res.render('signup', { name, email, password })
    }
    User.findOne({ where: { email } })
      .then(user => {
        if (user) {
          req.flash('errorMsg', '此信箱已經註冊')
          return res.render('signup', { name, email, password })
        }
        User.create({ name, email, password: hashPassword })
          .then(() => {
            req.flash('successMsg', '註冊成功')
            res.redirect('/signin')
          })
      })
  }
}
module.exports = userController



