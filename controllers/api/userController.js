const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const jwt = require('jsonwebtoken')

const userService = require('../../services/userService')

const userController = {
  signIn: (req, res) => {
    const username = req.body.email
    const password = req.body.password
    if (!username || !password) {
      return res.json({ status: 'error', message: "required fields didn't exist" })
    }

    User.findOne({ where: { email: username } }).then(user => {
      const { id, name, email, isAdmin } = user
      if (!user) return res.status(401).json({ status: 'error', message: 'no such user found' })
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: 'passwords did not match' })
      }

      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: { id, name, email, isAdmin }
      })
    })
  },
  signUp: (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const avtarDefault = ['https://i.imgur.com/cr7fyXC.png', 'https://i.imgur.com/0R9kFRX.png', 'https://i.imgur.com/P8VVdDm.png', 'https://i.imgur.com/U31wP5Z.png']
    let random = Math.floor(Math.random() * 4) + 1

    if (password !== confirmPassword) {
      return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
    }

    User.findOne({ where: { email } })
      .then(user => {
        const image = avtarDefault[random]
        if (user) {
          return res.json({ status: 'error', message: '信箱重複！' })
        }
        return User.create({ name, email, password: hashPassword, image })
          .then(() => res.json({ status: 'success', message: '成功註冊帳號！' }))
      })
  },
  getUser: (req, res) => {
    userService.getUser(req, res, data => res.json(data))
  },
  putUser: (req, res) => {
    userService.putUser(req, res, data => res.json(data))
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, data => res.json(data))
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, data => res.json(data))
  },
  addLike: (req, res) => {
    userService.addLike(req, res, data => res.json(data))
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, data => res.json(data))
  },
  getTopUsers: (req, res) => {
    userService.getTopUsers(req, res, data => res.json(data))
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, data => res.json(data))
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, data => res.json(data))
  }
}

module.exports = userController