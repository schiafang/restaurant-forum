const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: (req, res, callback) => {
    const RestaurantId = req.body.restaurantId
    const UserId = req.user.id
    const text = req.body.text
    return Comment.create({ text, RestaurantId, UserId })
      .then(() => callback({ status: 'success', message: '', RestaurantId }))
  },
  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then(comment => comment.destroy())
      .then(comment => callback({ status: 'success', message: '', RestaurantId: comment.RestaurantId }))
  }
}
module.exports = commentService