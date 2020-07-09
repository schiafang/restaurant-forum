const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
        User.create({ name, email, password: hashPassword, image })
          .then(() => {
            req.flash('successMsg', '註冊成功')
            res.redirect('/signin')
          })
      })
  },
  getUser: (req, res) => {
    const id = req.params.id
    Comment.findAndCountAll({ where: { UserId: id } }).then(result => {
      let count = result.count
      return User.findByPk(id, { include: { model: Comment, include: [Restaurant] } })
        .then(profile => res.render('profile', { profile: profile.toJSON(), count }))
    })
  },
  editUser: (req, res) => {
    const id = req.user.id
    User.findByPk(id, { raw: true }).then(user => {
      res.render('profile-edit', { user })
    })
  },
  putUser: (req, res) => {
    const id = req.user.id
    const name = req.body.name
    const { file } = req
    if (!name) {
      req.flash('errorMsg', "name didn't exist")
      return res.redirect('back')
    }
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        let image = img.data.link
        return User.findByPk(id)
          .then(user => user.update({ name, image }))
          .then(() => res.redirect(`${id}`))
      })
    } else {  //如果只更新名字沒有上傳圖片
      return User.findByPk(id)
        .then(user => user.update({ name }))
        .then(() => res.redirect(`${id}`))
    }
  },
  addFavorite: (req, res) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Favorite.create({ UserId, RestaurantId })
      .then(() => res.redirect('back'))
  },
  removeFavorite: (req, res) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Favorite.findOne({ where: { UserId, RestaurantId } })
      .then(favorite => favorite.destroy())
      .then(() => res.redirect('back'))
  },
  addLike: (req, res) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Like.create({ RestaurantId, UserId })
      .then(() => res.redirect('back'))
  },
  removeLike: (req, res) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Like.findOne({ where: { RestaurantId, UserId } })
      .then(like => like.destroy())
      .then(() => res.redirect('back'))
  },
  getTopUsers: (req, res) => {
    return User.findAll({ include: { model: User, as: 'Followers' } })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(item => item.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUsers', { users })
      })
  }
}
module.exports = userController



