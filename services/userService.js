const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
  getUser: (req, res, callback) => {
    const id = req.params.id
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

        //過濾重複評論餐廳
        let commentsRestaurant = profile.Comments.map(item => ({
          id: item.Restaurant.id,
          name: item.Restaurant.name,
          image: item.Restaurant.image
        }))
        let set = new Set()
        commentsRestaurant = commentsRestaurant.filter(item => !set.has(item.id) ? set.add(item.id) : false)

        const isFollowing = req.user.Followings.map(item => item.id).includes(Number(id))
        const countCommentedRestaurant = commentsRestaurant.length
        const countFavoritedRestaurants = profile.FavoritedRestaurants.length
        const countFollowings = profile.Followings.length
        const countFollowers = profile.Followers.length

        return callback({ profile, isFollowing, countCommentedRestaurant, countFavoritedRestaurants, countFollowings, countFollowers, commentsRestaurant })
      })
  },
  putUser: (req, res, callback) => {
    const id = req.user.id
    const name = req.body.name
    const { file } = req
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        let image = img.data.link
        return User.findByPk(id)
          .then(user => user.update({ name, image }))
          .then(() => callback({ status: 'success', message: "profile update success" }))
      })
    } else {  //如果只更新名字沒有上傳圖片
      return User.findByPk(id)
        .then(user => user.update({ name }))
        .then(() => callback({ status: 'success', message: "profile update success" }))
    }
  },
  addFavorite: (req, res, callback) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Favorite.create({ UserId, RestaurantId })
      .then(() => callback({ status: 'success', message: '' }))
  },
  removeFavorite: (req, res, callback) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Favorite.findOne({ where: { UserId, RestaurantId } })
      .then(favorite => favorite.destroy())
      .then(() => callback({ status: 'success', message: '' }))
  },
  addLike: (req, res, callback) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Like.create({ RestaurantId, UserId })
      .then(() => callback({ status: 'success', message: '' }))
  },
  removeLike: (req, res, callback) => {
    const RestaurantId = req.params.id
    const UserId = req.user.id
    return Like.findOne({ where: { RestaurantId, UserId } })
      .then(like => like.destroy())
      .then(() => callback({ status: 'success', message: '' }))
  },
  getTopUsers: (req, res, callback) => {
    const UserId = req.user.id
    return User.findAll({ include: { model: User, as: 'Followers' } })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(item => item.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.followerCount - a.followerCount)
        return callback({ users, UserId })
      })
  },
  addFollowing: (req, res, callback) => {
    const followingId = req.params.id
    const followerId = req.user.id
    return Followship.create({ followingId, followerId })
      .then(() => callback({ status: 'success', message: '' }))
  },
  removeFollowing: (req, res) => {
    const followingId = req.params.id
    const followerId = req.user.id
    return Followship.findOne({ where: { followingId, followerId } })
      .then(followship => followship.destroy())
      .then(() => callback({ status: 'success', message: '' }))
  }
}

module.exports = userService