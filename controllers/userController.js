const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
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
        return User.create({ name, email, password: hashPassword, image })
          .then(() => {
            req.flash('successMsg', '註冊成功')
            res.redirect('/signin')
          })
      })
  },
  getUser: (req, res) => {
    const id = req.params.id
    // User.findByPk(id, { include: { all: true } })  //偷吃步通通撈出來
    User.findByPk(id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Comment, include: Restaurant }
      ]
    })
      .then(profile => {
        profile = profile.toJSON()
        //取出所有評論過的餐廳中需要且會重複的資料(id,name,image)
        let commentsRestaurant = profile.Comments.map(item => ({
          id: item.Restaurant.id,
          name: item.Restaurant.name,
          image: item.Restaurant.image
        }))
        //過濾重複物件
        let set = new Set()
        commentsRestaurant = commentsRestaurant.filter(item => !set.has(item.id) ? set.add(item.id) : false)

        const isFollowing = req.user.Followings.map(item => item.id).includes(Number(id)) //判斷使用者是否已追隨此用戶
        const countCommentedRestaurant = commentsRestaurant.length //計算已評論餐廳數
        const countFavoritedRestaurants = profile.FavoritedRestaurants.length //計算已收藏餐廳數
        const countFollowings = profile.Followings.length //計算已追蹤者人數
        const countFollowers = profile.Followers.length //計算已追蹤者人數

        return res.render('profile', { profile, isFollowing, countCommentedRestaurant, countFavoritedRestaurants, countFollowings, countFollowers, commentsRestaurant })
      })
  },
  editUser: (req, res) => {
    const id = req.params.id

    if (Number(id) !== req.user.id) { return res.redirect('/restaurants') }

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
    const UserId = req.user.id
    return User.findAll({ include: { model: User, as: 'Followers' } })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(item => item.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.followerCount - a.followerCount)
        res.render('topUsers', { users, UserId })
      })
  },
  addFollowing: (req, res) => {
    const followingId = req.params.id
    const followerId = req.user.id
    return Followship.create({ followingId, followerId })
      .then(() => res.redirect('back'))
  },
  removeFollowing: (req, res) => {
    const followingId = req.params.id
    const followerId = req.user.id
    return Followship.findOne({ where: { followingId, followerId } })
      .then(followship => followship.destroy())
      .then(() => res.redirect('back'))
  }
}
module.exports = userController

