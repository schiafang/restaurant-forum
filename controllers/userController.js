const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userService = require('../services/userService')

const userController = {
  signUpPage: (req, res) => res.render('signup'),
  signInPage: (req, res) => res.render('signin'),
  singIn: (req, res) => {
    req.flash('successMsg', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('successMsg', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  signUp: (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const avtarDefault = ['https://i.imgur.com/cr7fyXC.png', 'https://i.imgur.com/0R9kFRX.png', 'https://i.imgur.com/P8VVdDm.png', 'https://i.imgur.com/U31wP5Z.png']
    let random = Math.floor(Math.random() * 4) + 1

    if (password !== confirmPassword) {
      req.flash('errorMsg', '密碼與確認密碼必須相同')
      return res.render('signup', { name, email, password })
    }
    User.findOne({ where: { email } })
      .then(user => {
        const image = avtarDefault[random]
        if (user) {
          req.flash('errorMsg', '此信箱已經註冊')
          return res.render('signup', { name, email, password })
        }
        return User.create({ name, email, password: hashPassword, image })
          .then(() => {
            req.flash('successMsg', '註冊成功')
            res.redirect('/signin')
          })
      })
  },
  // no API need
  editUser: (req, res) => {
    const id = req.params.id

    if (Number(id) !== req.user.id) { return res.redirect('/restaurants') }

    User.findByPk(id, { raw: true }).then(user => {
      res.render('profile-edit', { user })
    })
  },
  getUser: (req, res) => {
    userService.getUser(req, res, data => {
      return res.render('profile', data)
    })
  },
  putUser: (req, res) => {
    userService.putUser(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('errorMsg', data['message'])
        return res.redirect('back')
      }
      return res.redirect(`/users/${req.user.id}`)
    })
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, () => res.redirect('back'))
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, () => res.redirect('back'))
  },
  addLike: (req, res) => {
    userService.addLike(req, res, () => res.redirect('back'))
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, () => res.redirect('back'))
  },
  getTopUsers: (req, res) => {
    userService.getTopUsers(req, res, data => res.render('topUsers', data)
    )
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, () => res.redirect('back'))
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, () => res.redirect('back'))
  }
}
module.exports = userController

